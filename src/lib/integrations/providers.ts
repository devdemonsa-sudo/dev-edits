import type { IntegrationAuthMode, IntegrationProviderKey } from "./types";

export type IntegrationProviderConfig = {
  key: IntegrationProviderKey;
  label: string;
  shortLabel: string;
  authMode: IntegrationAuthMode;
  statusLabel: string;
  description: string;
  color: string;
  glyph: string;
  scopes?: string[];
  clientIdEnv?: string;
  clientSecretEnv?: string;
  authorizeUrl?: string;
  tokenUrl?: string;
  requiresShopDomain?: boolean;
  requiresManualCredentials?: boolean;
  requiresPartnerApp?: boolean;
  notes: string[];
};

const shopifyScopes = (process.env.SHOPIFY_OAUTH_SCOPES ?? "read_orders,read_products,read_customers,read_fulfillments")
  .split(",")
  .map((scope) => scope.trim())
  .filter(Boolean);

const ebayScopes = (process.env.EBAY_OAUTH_SCOPES ?? "https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly,https://api.ebay.com/oauth/api_scope/sell.inventory.readonly,https://api.ebay.com/oauth/api_scope/sell.analytics.readonly")
  .split(",")
  .map((scope) => scope.trim())
  .filter(Boolean);

const stripeScopes = (process.env.STRIPE_OAUTH_SCOPES ?? "read_write")
  .split(",")
  .map((scope) => scope.trim())
  .filter(Boolean);

export const integrationProviders: Record<IntegrationProviderKey, IntegrationProviderConfig> = {
  shopify: {
    key: "shopify",
    label: "Shopify",
    shortLabel: "Shopify",
    authMode: "oauth",
    statusLabel: "Integração oficial",
    description: "Conecte o admin da loja Shopify com OAuth por domínio da loja para ler pedidos, reembolsos e catálogo.",
    color: "#95BF47",
    glyph: "S",
    clientIdEnv: "SHOPIFY_CLIENT_ID",
    clientSecretEnv: "SHOPIFY_CLIENT_SECRET",
    authorizeUrl: "shopify",
    tokenUrl: "shopify",
    scopes: shopifyScopes,
    requiresShopDomain: true,
    notes: [
      "Oficializamos este fluxo primeiro por ser OAuth nativo da plataforma.",
      "O lojista informa o domínio myshopify.com da loja.",
      "O app solicita autorização no admin da loja."
    ]
  },
  woocommerce: {
    key: "woocommerce",
    label: "WooCommerce",
    shortLabel: "WooCommerce",
    authMode: "manual",
    statusLabel: "Conexão manual oficial",
    description: "Conecte uma loja WooCommerce com Consumer Key e Consumer Secret gerados no painel do WordPress.",
    color: "#7F54B3",
    glyph: "W",
    requiresManualCredentials: true,
    notes: [
      "Mantemos como integração manual oficial, sem exigir OAuth.",
      "O lojista gera Consumer Key e Consumer Secret no próprio WordPress.",
      "A API é validada com uma chamada de teste ao endpoint da loja."
    ]
  },
  amazon: {
    key: "amazon",
    label: "Amazon",
    shortLabel: "Amazon",
    authMode: "partner",
    statusLabel: "Parceria / onboarding",
    description: "A Amazon SP-API depende do fluxo oficial de autorização do Seller Central e da configuração do app de parceiro.",
    color: "#FF9900",
    glyph: "A",
    requiresPartnerApp: true,
    notes: [
      "Amazon fica como parceria/onboarding assistido.",
      "A integração depende do app e das credenciais do parceiro.",
      "Não prometemos login direto até a validação oficial do programa."
    ]
  },
  ebay: {
    key: "ebay",
    label: "eBay",
    shortLabel: "eBay",
    authMode: "oauth",
    statusLabel: "Integração oficial",
    description: "Autenticação via OAuth 2.0 com os escopos definidos no Developer Program da eBay.",
    color: "#111827",
    glyph: "EB",
    clientIdEnv: "EBAY_CLIENT_ID",
    clientSecretEnv: "EBAY_CLIENT_SECRET",
    authorizeUrl: "https://auth.ebay.com/oauth2/authorize",
    tokenUrl: "https://api.ebay.com/identity/v1/oauth2/token",
    scopes: ebayScopes,
    notes: [
      "Oficializamos este fluxo como login OAuth do Developer Program.",
      "eBay usa OAuth 2.0 para autorização de usuário e aplicativo.",
      "Os escopos variam conforme os recursos que você quer ler."
    ]
  },
  magalu: {
    key: "magalu",
    label: "Magalu",
    shortLabel: "Magalu",
    authMode: "oauth",
    statusLabel: "Integração oficial",
    description: "A Magalu Devs oferece fluxo OAuth 2.0 e APIs para integrar pedidos e catálogo.",
    color: "#1E40AF",
    glyph: "MZ",
    clientIdEnv: "MAGALU_CLIENT_ID",
    clientSecretEnv: "MAGALU_CLIENT_SECRET",
    authorizeUrl: process.env.MAGALU_OAUTH_AUTHORIZE_URL,
    tokenUrl: process.env.MAGALU_OAUTH_TOKEN_URL,
    scopes: (process.env.MAGALU_OAUTH_SCOPES ?? "").split(",").map((scope) => scope.trim()).filter(Boolean),
    notes: [
      "Este é o próximo passo depois das integrações já oficializadas.",
      "O acesso depende do app criado no portal da Magalu.",
      "Se o ambiente OAuth não estiver configurado, o card mostra orientação."
    ]
  },
  stripe: {
    key: "stripe",
    label: "Stripe",
    shortLabel: "Stripe",
    authMode: "oauth",
    statusLabel: "Integração oficial",
    description: "Use Stripe Connect para autorizar contas e puxar dados de pagamento com o fluxo oficial da plataforma.",
    color: "#635BFF",
    glyph: "S",
    clientIdEnv: "STRIPE_CLIENT_ID",
    clientSecretEnv: "STRIPE_CLIENT_SECRET",
    authorizeUrl: "https://connect.stripe.com/oauth/authorize",
    tokenUrl: "https://connect.stripe.com/oauth/token",
    scopes: stripeScopes,
    notes: [
      "Oficializamos este fluxo via Stripe Connect.",
      "Stripe Connect suporta autorização por código.",
      "O callback devolve o account ID e os dados da conta conectada."
    ]
  },
  paypal: {
    key: "paypal",
    label: "PayPal",
    shortLabel: "PayPal",
    authMode: "oauth",
    statusLabel: "Integração oficial",
    description: "Conecte a conta PayPal via OAuth 2.0 para ler transações e status de pagamento.",
    color: "#003087",
    glyph: "PP",
    clientIdEnv: "PAYPAL_CLIENT_ID",
    clientSecretEnv: "PAYPAL_CLIENT_SECRET",
    authorizeUrl: process.env.PAYPAL_OAUTH_AUTHORIZE_URL,
    tokenUrl: process.env.PAYPAL_OAUTH_TOKEN_URL,
    scopes: (process.env.PAYPAL_OAUTH_SCOPES ?? "").split(",").map((scope) => scope.trim()).filter(Boolean),
    notes: [
      "Oficializamos este fluxo via OAuth no painel do PayPal.",
      "O app precisa do cadastro OAuth no painel do PayPal.",
      "Os endpoints podem variar entre sandbox e produção."
    ]
  }
};

export function getIntegrationProvider(provider: string) {
  return integrationProviders[provider as IntegrationProviderKey] ?? null;
}

export function getIntegrationProviderList() {
  return Object.values(integrationProviders);
}

export function getIntegrationProviderSetupNotes(provider: IntegrationProviderKey) {
  return integrationProviders[provider].notes;
}

export function isOAuthProvider(provider: IntegrationProviderKey) {
  return integrationProviders[provider].authMode === "oauth";
}

export function isManualProvider(provider: IntegrationProviderKey) {
  return integrationProviders[provider].authMode === "manual";
}

export function isPartnerProvider(provider: IntegrationProviderKey) {
  return integrationProviders[provider].authMode === "partner";
}
