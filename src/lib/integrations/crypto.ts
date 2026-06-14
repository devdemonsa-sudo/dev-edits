import crypto from "node:crypto";

const DEFAULT_SECRET_LABEL = "integration-token-secret";

function concatBytes(...chunks: Uint8Array[]) {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.length;
  }
  return output;
}

function getSecretKeyMaterial() {
  const secret = process.env.INTEGRATION_TOKEN_SECRET ?? process.env.SUPABASE_SECRET_KEY;
  if (!secret) {
    return null;
  }

  return new Uint8Array(crypto.createHash("sha256").update(secret).digest());
}

export function hasIntegrationSecret() {
  return Boolean(getSecretKeyMaterial());
}

export function encryptIntegrationValue(value: string) {
  const key = getSecretKeyMaterial();
  if (!key) {
    throw new Error(`Missing ${DEFAULT_SECRET_LABEL}.`);
  }

  const iv = new Uint8Array(crypto.randomBytes(12));
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = concatBytes(
    Uint8Array.from(cipher.update(value, "utf8")),
    Uint8Array.from(cipher.final())
  );
  const tag = Uint8Array.from(cipher.getAuthTag());

  return Buffer.from(concatBytes(iv, tag, encrypted)).toString("base64url");
}

export function decryptIntegrationValue(payload: string) {
  const key = getSecretKeyMaterial();
  if (!key) {
    throw new Error(`Missing ${DEFAULT_SECRET_LABEL}.`);
  }

  const raw = Buffer.from(payload, "base64url");
  const iv = Uint8Array.from(raw.subarray(0, 12));
  const tag = Uint8Array.from(raw.subarray(12, 28));
  const encrypted = Uint8Array.from(raw.subarray(28));
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  return Buffer.from(
    concatBytes(Uint8Array.from(decipher.update(encrypted)), Uint8Array.from(decipher.final()))
  ).toString("utf8");
}

export function signIntegrationState(payload: Record<string, unknown>) {
  const key = getSecretKeyMaterial();
  if (!key) {
    throw new Error(`Missing ${DEFAULT_SECRET_LABEL}.`);
  }

  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = crypto.createHmac("sha256", key).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function parseIntegrationState(token: string) {
  const key = getSecretKeyMaterial();
  if (!key) {
    throw new Error(`Missing ${DEFAULT_SECRET_LABEL}.`);
  }

  const [body, signature] = token.split(".");
  if (!body || !signature) {
    throw new Error("Invalid integration state.");
  }

  const expected = crypto.createHmac("sha256", key).update(body).digest("base64url");
  const signatureBuffer = Uint8Array.from(Buffer.from(signature));
  const expectedBuffer = Uint8Array.from(Buffer.from(expected));
  if (signatureBuffer.length !== expectedBuffer.length) {
    throw new Error("Invalid integration state signature.");
  }

  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    throw new Error("Invalid integration state signature.");
  }

  const decoded = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Record<string, unknown>;
  return decoded;
}
