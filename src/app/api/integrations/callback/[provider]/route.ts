import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { encryptIntegrationValue, parseIntegrationState } from "@/lib/integrations/crypto";
import { getIntegrationProvider, isOAuthProvider } from "@/lib/integrations/providers";

async function exchangeToken(params: {
  provider: string;
  code: string;
  redirectUri: string;
  shop?: string;
}) {
  const providerConfig = getIntegrationProvider(params.provider);
  if (!providerConfig || !isOAuthProvider(providerConfig.key)) {
    throw new Error("Fluxo OAuth indisponível para a plataforma.");
  }

  if (params.provider === "shopify") {
    const clientId = process.env.SHOPIFY_CLIENT_ID;
    const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
    if (!clientId || !clientSecret || !params.shop) {
      throw new Error("Configuração Shopify incompleta.");
    }

    const response = await fetch(`https://${params.shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: params.code
      })
    });

    if (!response.ok) {
      throw new Error(`Shopify retornou ${response.status}.`);
    }

    return (await response.json()) as {
      access_token?: string;
      scope?: string;
    };
  }

  const clientIdEnv = providerConfig.clientIdEnv;
  const clientSecretEnv = providerConfig.clientSecretEnv;
  const clientId = clientIdEnv ? process.env[clientIdEnv] : undefined;
  const clientSecret = clientSecretEnv ? process.env[clientSecretEnv] : undefined;
  if (!clientId || !clientSecret) {
    throw new Error(`Configure ${clientIdEnv} e ${clientSecretEnv}.`);
  }

  const tokenUrl = providerConfig.tokenUrl;
  if (!tokenUrl) {
    throw new Error("Token URL não configurada.");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: params.code,
    redirect_uri: params.redirectUri
  });

  if (providerConfig.key === "stripe") {
    body.set("client_secret", clientSecret);
  }

  const headers: Record<string, string> = { "Content-Type": "application/x-www-form-urlencoded" };

  if (providerConfig.key === "ebay" || providerConfig.key === "paypal" || providerConfig.key === "magalu") {
    headers.Authorization = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
  }

  if (providerConfig.key === "stripe") {
    body.set("client_secret", clientSecret);
    body.set("client_id", clientId);
  }

  if (providerConfig.key === "ebay") {
    body.set("redirect_uri", params.redirectUri);
    if (providerConfig.scopes?.length) {
      body.set("scope", providerConfig.scopes.join(" "));
    }
  }

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers,
    body
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Falha ao trocar token em ${providerConfig.label}: ${response.status} ${errorText}`);
  }

  return (await response.json()) as Record<string, unknown>;
}

type IntegrationTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  scope?: string;
  expires_in?: number;
  token_type?: string;
  livemode?: boolean;
  stripe_user_id?: string;
  account_id?: string;
  [key: string]: unknown;
};

export async function GET(request: NextRequest, context: { params: Promise<{ provider: string }> }) {
  const auth = await getAuthenticatedUser();
  if (!auth.configured) {
    return NextResponse.json({ error: "Supabase não configurado." }, { status: 400 });
  }

  const { provider } = await context.params;
  const providerConfig = getIntegrationProvider(provider);
  if (!providerConfig) {
    return NextResponse.json({ error: "Plataforma não suportada." }, { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams;
  const error = searchParams.get("error");
  if (error) {
    return NextResponse.redirect(new URL(`/integrations?error=${encodeURIComponent(error)}`, request.url));
  }

  const stateToken = searchParams.get("state");
  const code = searchParams.get("code");
  if (!stateToken || !code) {
    return NextResponse.redirect(new URL(`/integrations?error=invalid_callback`, request.url));
  }

  const state = parseIntegrationState(stateToken) as {
    provider?: string;
    shop?: string;
    userId?: string;
    ts?: number;
  };

  if (state.provider !== provider || state.userId !== auth.userId) {
    return NextResponse.redirect(new URL(`/integrations?error=invalid_state`, request.url));
  }

  if (typeof state.ts !== "number" || Date.now() - state.ts > 10 * 60 * 1000) {
    return NextResponse.redirect(new URL(`/integrations?error=expired_state`, request.url));
  }

  try {
    const token = await exchangeToken({
      code,
      provider,
      redirectUri: new URL(`/api/integrations/callback/${provider}`, request.url).toString(),
      shop: typeof state.shop === "string" ? state.shop : undefined
    }) as IntegrationTokenResponse;

    const supabase = await createClient();
    const scopes = String(token.scope ?? "")
      .split(/[,\s]+/)
      .map((scope) => scope.trim())
      .filter(Boolean);
    const expiresIn = typeof token.expires_in === "number" ? token.expires_in : null;
    const payload = {
      provider,
      auth_response: token
    };

    const connectionInsert = {
      user_id: auth.userId,
      provider,
      connection_type: "oauth",
      status: "connected",
      account_label:
        provider === "shopify"
          ? (typeof state.shop === "string" ? state.shop : "Shopify")
          : providerConfig.label,
      external_account_id:
        typeof token.stripe_user_id === "string"
          ? token.stripe_user_id
          : typeof token.account_id === "string"
            ? token.account_id
            : null,
      store_url: typeof state.shop === "string" ? `https://${state.shop}` : null,
      scopes,
      token_payload_enc: encryptIntegrationValue(JSON.stringify(payload)),
      refresh_token_enc: typeof token.refresh_token === "string" ? encryptIntegrationValue(token.refresh_token) : null,
      expires_at: expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null,
      settings: {
        livemode: Boolean(token.livemode),
        token_type: token.token_type ?? null
      }
    };

    const { error: insertError } = await supabase.from("integration_connections").insert(connectionInsert);
    if (insertError) {
      throw new Error(insertError.message);
    }

    await supabase.from("audit_logs").insert({
      user_id: auth.userId,
      action: `integration.${provider}.connected`,
      entity_type: "integration_connection",
      details: { provider }
    });

    return NextResponse.redirect(new URL(`/integrations?connected=${provider}`, request.url));
  } catch (callbackError) {
    const message = callbackError instanceof Error ? callbackError.message : "Falha inesperada ao conectar.";
    return NextResponse.redirect(new URL(`/integrations?error=${encodeURIComponent(message)}`, request.url));
  }
}
