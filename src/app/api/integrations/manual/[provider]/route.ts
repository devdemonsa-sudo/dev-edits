import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { encryptIntegrationValue } from "@/lib/integrations/crypto";
import { getIntegrationProvider, isManualProvider } from "@/lib/integrations/providers";

export async function POST(request: NextRequest, context: { params: Promise<{ provider: string }> }) {
  const auth = await getAuthenticatedUser();
  if (!auth.configured) {
    return NextResponse.json({ error: "Supabase não configurado." }, { status: 400 });
  }

  const { provider } = await context.params;
  const providerConfig = getIntegrationProvider(provider);
  if (!providerConfig || !isManualProvider(providerConfig.key)) {
    return NextResponse.json({ error: "Esta rota é exclusiva para integrações manuais." }, { status: 400 });
  }

  const formData = await request.formData();
  const siteUrl = String(formData.get("site_url") ?? "").trim();
  const consumerKey = String(formData.get("consumer_key") ?? "").trim();
  const consumerSecret = String(formData.get("consumer_secret") ?? "").trim();
  const accountLabel = String(formData.get("account_label") ?? "").trim();

  if (!siteUrl || !consumerKey || !consumerSecret) {
    return NextResponse.json({ error: "Preencha URL da loja, consumer key e consumer secret." }, { status: 400 });
  }

  let host = siteUrl;
  try {
    host = new URL(siteUrl).hostname;
  } catch {
    return NextResponse.json({ error: "Informe uma URL válida para a loja WooCommerce." }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("integration_connections").insert({
    user_id: auth.userId,
    provider,
    connection_type: "manual",
    status: "connected",
    account_label: accountLabel || host,
    store_url: siteUrl,
    scopes: ["read", "write"],
    token_payload_enc: encryptIntegrationValue(
      JSON.stringify({
        consumer_key: consumerKey,
        consumer_secret: consumerSecret,
        site_url: siteUrl
      })
    ),
    settings: {
      connection_style: "consumer_key"
    }
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("audit_logs").insert({
    user_id: auth.userId,
    action: `integration.${provider}.connected`,
    entity_type: "integration_connection",
    details: { provider }
  });

  return NextResponse.redirect(new URL(`/integrations?connected=${provider}`, request.url));
}

