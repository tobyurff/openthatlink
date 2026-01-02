import { CONFIG } from "./config";
import { generateSecret, validateSecret } from "./secret";

const STORAGE_KEY_SECRET = CONFIG.STORAGE_KEY_SECRET;
const STORAGE_KEY_BASE_URL = "otl_base_url";

export interface ExtensionConfig {
  secret: string;
  baseUrl: string;
}

/**
 * Get the stored secret, or null if not found/invalid
 */
export async function getStoredSecret(): Promise<string | null> {
  const result = await browser.storage.local.get(STORAGE_KEY_SECRET);
  const secret = result[STORAGE_KEY_SECRET];

  if (typeof secret === "string" && validateSecret(secret)) {
    return secret;
  }

  return null;
}

/**
 * Store a new secret
 */
export async function storeSecret(secret: string): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEY_SECRET]: secret });
}

/**
 * Get the stored base URL, or the default if not set
 */
export async function getStoredBaseUrl(): Promise<string> {
  const result = await browser.storage.local.get(STORAGE_KEY_BASE_URL);
  const baseUrl = result[STORAGE_KEY_BASE_URL];

  if (typeof baseUrl === "string" && baseUrl.trim()) {
    return baseUrl.trim().replace(/\/$/, ""); // Remove trailing slash
  }

  return CONFIG.PUBLIC_BASE_URL;
}

/**
 * Store a custom base URL
 */
export async function storeBaseUrl(baseUrl: string): Promise<void> {
  const normalized = baseUrl.trim().replace(/\/$/, "");
  await browser.storage.local.set({ [STORAGE_KEY_BASE_URL]: normalized });
}

/**
 * Reset base URL to default
 */
export async function resetBaseUrl(): Promise<void> {
  await browser.storage.local.remove(STORAGE_KEY_BASE_URL);
}

/**
 * Get the full extension config (secret + base URL)
 */
export async function getExtensionConfig(): Promise<ExtensionConfig> {
  const [secret, baseUrl] = await Promise.all([
    getOrCreateSecret(),
    getStoredBaseUrl(),
  ]);
  return { secret, baseUrl };
}

/**
 * Get existing secret or generate and store a new one
 */
export async function getOrCreateSecret(): Promise<string> {
  const existing = await getStoredSecret();
  if (existing) {
    return existing;
  }

  const newSecret = generateSecret();
  await storeSecret(newSecret);
  return newSecret;
}

/**
 * Regenerate the secret (creates a new one, replacing the old)
 */
export async function regenerateSecret(): Promise<string> {
  const newSecret = generateSecret();
  await storeSecret(newSecret);
  return newSecret;
}
