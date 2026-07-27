import crypto from "node:crypto";
import { createRequire } from "node:module";
import type StripeClient from "stripe";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { storeSettings } from "../../shared/schema.js";

const SETTINGS_KEY = "stripe_credentials";
const API_VERSION = "2025-10-29.clover" as const;
const require = createRequire(import.meta.url);
const Stripe = require("stripe") as typeof import("stripe").default;

type EncryptedValue = { iv: string; tag: string; ciphertext: string };
type StoredStripeCredentials = {
  publishableKey: string;
  secretKey: EncryptedValue;
  webhookSecret: EncryptedValue;
  mode: "test" | "live";
  accountId: string;
  accountName: string | null;
  configuredAt: string;
};

let cached: { client: StripeClient; publishableKey: string; webhookSecret: string; mode: "test" | "live"; accountId: string; accountName: string | null; source: "database" | "environment" } | null | undefined;

function encryptionKey() {
  const secret = process.env.CREDENTIAL_ENCRYPTION_KEY || process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("A 32-character CREDENTIAL_ENCRYPTION_KEY or SESSION_SECRET is required");
  return crypto.scryptSync(secret, "06coins-stripe-credentials-v1", 32);
}

function encrypt(value: string): EncryptedValue {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return { iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64"), ciphertext: ciphertext.toString("base64") };
}

function decrypt(value: EncryptedValue) {
  const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(value.iv, "base64"));
  decipher.setAuthTag(Buffer.from(value.tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(value.ciphertext, "base64")), decipher.final()]).toString("utf8");
}

function modeForKey(key: string): "test" | "live" | null {
  if (key.startsWith("sk_live_") || key.startsWith("rk_live_") || key.startsWith("pk_live_")) return "live";
  if (key.startsWith("sk_test_") || key.startsWith("rk_test_") || key.startsWith("pk_test_")) return "test";
  return null;
}

export async function loadStripeRuntime() {
  if (cached !== undefined) return cached;
  const [row] = await db.select().from(storeSettings).where(eq(storeSettings.key, SETTINGS_KEY)).limit(1);
  if (row) {
    try {
      const value = row.value as StoredStripeCredentials;
      cached = { client: new Stripe(decrypt(value.secretKey), { apiVersion: API_VERSION }), publishableKey: value.publishableKey, webhookSecret: decrypt(value.webhookSecret), mode: value.mode, accountId: value.accountId, accountName: value.accountName, source: "database" };
      return cached;
    } catch {
      cached = null;
      return cached;
    }
  }
  if (process.env.STRIPE_SECRET_KEY && process.env.VITE_STRIPE_PUBLIC_KEY && process.env.STRIPE_WEBHOOK_SECRET) {
    const mode = modeForKey(process.env.STRIPE_SECRET_KEY);
    if (mode) {
      cached = { client: new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: API_VERSION }), publishableKey: process.env.VITE_STRIPE_PUBLIC_KEY, webhookSecret: process.env.STRIPE_WEBHOOK_SECRET, mode, accountId: "environment", accountName: null, source: "environment" };
      return cached;
    }
  }
  cached = null;
  return cached;
}

export async function saveStripeCredentials(input: { publishableKey: string; secretKey: string; webhookSecret: string }, updatedBy: string) {
  const publishableMode = modeForKey(input.publishableKey);
  const secretMode = modeForKey(input.secretKey);
  if (!publishableMode || !input.publishableKey.startsWith("pk_")) throw new Error("Enter a valid Stripe publishable key");
  if (!secretMode || (!input.secretKey.startsWith("sk_") && !input.secretKey.startsWith("rk_"))) throw new Error("Enter a valid Stripe secret or restricted key");
  if (publishableMode !== secretMode) throw new Error("Publishable and secret keys must both use the same Stripe mode");
  if (!input.webhookSecret.startsWith("whsec_") || input.webhookSecret.length < 16) throw new Error("Enter the webhook endpoint signing secret beginning with whsec_");

  const client = new Stripe(input.secretKey, { apiVersion: API_VERSION });
  const account = await client.accounts.retrieve();
  const stored: StoredStripeCredentials = {
    publishableKey: input.publishableKey,
    secretKey: encrypt(input.secretKey),
    webhookSecret: encrypt(input.webhookSecret),
    mode: secretMode,
    accountId: account.id,
    accountName: account.business_profile?.name || account.settings?.dashboard?.display_name || null,
    configuredAt: new Date().toISOString(),
  };
  await db.insert(storeSettings).values({ key: SETTINGS_KEY, value: stored, updatedBy, updatedAt: new Date() }).onDuplicateKeyUpdate({ set: { value: stored, updatedBy, updatedAt: new Date() } });
  cached = { client, publishableKey: stored.publishableKey, webhookSecret: input.webhookSecret, mode: stored.mode, accountId: stored.accountId, accountName: stored.accountName, source: "database" };
  return { ...stripeStatus(cached), ready: Boolean(account.charges_enabled && account.details_submitted), apiConnected: true, chargesEnabled: account.charges_enabled, payoutsEnabled: account.payouts_enabled, detailsSubmitted: account.details_submitted };
}

export async function removeStripeCredentials() {
  await db.delete(storeSettings).where(eq(storeSettings.key, SETTINGS_KEY));
  cached = undefined;
}

export function stripeStatus(runtime: Awaited<ReturnType<typeof loadStripeRuntime>>) {
  if (!runtime) return { configured: false, ready: false, mode: null, accountId: null, accountName: null, source: null };
  return { configured: true, ready: true, mode: runtime.mode, accountId: runtime.accountId, accountName: runtime.accountName, source: runtime.source, publishableKeyHint: `${runtime.publishableKey.slice(0, 12)}••••${runtime.publishableKey.slice(-4)}`, webhookConfigured: Boolean(runtime.webhookSecret) };
}
