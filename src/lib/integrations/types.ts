export type IntegrationProviderKey =
  | "shopify"
  | "woocommerce"
  | "amazon"
  | "ebay"
  | "magalu"
  | "stripe"
  | "paypal";

export type IntegrationAuthMode = "oauth" | "manual" | "partner";

export type IntegrationConnectionStatus = "pending" | "connected" | "needs_setup" | "error";

export type IntegrationConnectionRecord = {
  id: string;
  provider: IntegrationProviderKey | string;
  connection_type: string;
  status: IntegrationConnectionStatus | string;
  account_label: string | null;
  external_account_id: string | null;
  store_url: string | null;
  scopes: string[] | null;
  expires_at: string | null;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
  settings: Record<string, unknown> | null;
};
