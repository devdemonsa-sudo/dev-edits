import crypto from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { getIntegrationProvider, isManualProvider, isPartnerProvider } from "@/lib/integrations/providers";
import { signIntegrationState } from "@/lib/integrations/crypto";

function buildUrl(base: string, params: Record<string, string | undefined>) {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }
  return url;
}

export async function GET(request: NextRequest, context: { params: Promise<{ provider: string }> }) {
  const { provider } = await context.params;
  const auth = await getAuthenticatedUser();
  if (!auth.configured) {
    return NextResponse.json({ error: "Supabase não configurado." }, { status: 400 });
  }

  const providerConfig = getIntegrationProvider(provider);
  if (!providerConfig) {
    return NextResponse.json({ error: "Plataforma não suportada." }, { status: 404 });
  }

  if (isManualProvider(providerConfig.key) || isPartnerProvider(providerConfig.key)) {
    return NextResponse.json(
      {
        error: "Esta plataforma não inicia login direto por essa rota.",
        provider: providerConfig.label
      },
      { status: 400 }
    );
  }

  const url = new URL(request.url);
  const callbackUrl = new URL(`/api/integrations/callback/${providerConfig.key}`, url.origin).toString();
  const nonce = crypto.randomUUID();

  const state = signIntegrationState({
    provider: providerConfig.key,
    nonce,
    shop: url.searchParams.get("shop") ?? undefined,
    userId: auth.userId,
    ts: Date.now()
  });

  if (provider === "shopify") {
    const shop = url.searchParams.get("shop");
    if (!shop) {
      return NextResponse.json({ error: "Informe o domínio da loja Shopify." }, { status: 400 });
    }

    if (!process.env.SHOPIFY_CLIENT_ID || !process.env.SHOPIFY_CLIENT_SECRET) {
      return NextResponse.json({ error: "Configure SHOPIFY_CLIENT_ID e SHOPIFY_CLIENT_SECRET." }, { status: 400 });
    }

    const authorizeUrl = buildUrl(`https://${shop}/admin/oauth/authorize`, {
      client_id: process.env.SHOPIFY_CLIENT_ID,
      scope: providerConfig.scopes?.join(","),
      state
    });

    return NextResponse.redirect(authorizeUrl);
  }

  if (provider === "ebay") {
    if (!process.env.EBAY_CLIENT_ID || !process.env.EBAY_CLIENT_SECRET || !providerConfig.authorizeUrl) {
      return NextResponse.json({ error: "Configure EBAY_CLIENT_ID e EBAY_CLIENT_SECRET." }, { status: 400 });
    }

    const authorizeUrl = buildUrl(providerConfig.authorizeUrl, {
      client_id: process.env.EBAY_CLIENT_ID,
      redirect_uri: callbackUrl,
      response_type: "code",
      scope: providerConfig.scopes?.join(" "),
      state
    });

    return NextResponse.redirect(authorizeUrl);
  }

  if (provider === "stripe") {
    if (!process.env.STRIPE_CLIENT_ID || !process.env.STRIPE_CLIENT_SECRET || !providerConfig.authorizeUrl) {
      return NextResponse.json({ error: "Configure STRIPE_CLIENT_ID e STRIPE_CLIENT_SECRET." }, { status: 400 });
    }

    const authorizeUrl = buildUrl(providerConfig.authorizeUrl, {
      client_id: process.env.STRIPE_CLIENT_ID,
      scope: providerConfig.scopes?.join(" "),
      redirect_uri: callbackUrl,
      state
    });

    return NextResponse.redirect(authorizeUrl);
  }

  if (provider === "magalu") {
    if (!providerConfig.authorizeUrl || !providerConfig.tokenUrl) {
      return NextResponse.json(
        {
          error: "Configure MAGALU_OAUTH_AUTHORIZE_URL e MAGALU_OAUTH_TOKEN_URL no servidor."
        },
        { status: 400 }
      );
    }

    const clientId = process.env.MAGALU_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json({ error: "Configure MAGALU_CLIENT_ID." }, { status: 400 });
    }

    const authorizeUrl = buildUrl(providerConfig.authorizeUrl, {
      client_id: clientId,
      redirect_uri: callbackUrl,
      response_type: "code",
      scope: providerConfig.scopes?.join(" "),
      state
    });

    return NextResponse.redirect(authorizeUrl);
  }

  if (provider === "paypal") {
    if (!providerConfig.authorizeUrl || !providerConfig.tokenUrl) {
      return NextResponse.json(
        {
          error: "Configure PAYPAL_OAUTH_AUTHORIZE_URL e PAYPAL_OAUTH_TOKEN_URL no servidor."
        },
        { status: 400 }
      );
    }

    const clientId = process.env.PAYPAL_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json({ error: "Configure PAYPAL_CLIENT_ID." }, { status: 400 });
    }

    const authorizeUrl = buildUrl(providerConfig.authorizeUrl, {
      client_id: clientId,
      response_type: "code",
      scope: providerConfig.scopes?.join(" "),
      redirect_uri: callbackUrl,
      state
    });

    return NextResponse.redirect(authorizeUrl);
  }

  return NextResponse.json({ error: "Fluxo não suportado para esta plataforma." }, { status: 400 });
}

