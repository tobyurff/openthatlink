import { CONFIG } from "./config";
import { generateSecret, validateSecret } from "./secret";

const STORAGE_KEY_SECRET = CONFIG.STORAGE_KEY_SECRET;
const STORAGE_KEY_BASE_URL = "otl_base_url";
const STORAGE_KEY_TURBO_END = CONFIG.STORAGE_KEY_TURBO_END;
const STORAGE_KEY_OPEN_COUNT = CONFIG.STORAGE_KEY_OPEN_COUNT;
const STORAGE_KEY_LAST_LINK = CONFIG.STORAGE_KEY_LAST_LINK;

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

/**
 * Check if turbo mode is currently active
 */
export async function isTurboModeActive(): Promise<boolean> {
  const result = await browser.storage.local.get(STORAGE_KEY_TURBO_END);
  const endTime = result[STORAGE_KEY_TURBO_END];

  if (typeof endTime === "number" && endTime > Date.now()) {
    return true;
  }

  return false;
}

/**
 * Get the turbo mode end timestamp (or null if not active)
 */
export async function getTurboEndTime(): Promise<number | null> {
  const result = await browser.storage.local.get(STORAGE_KEY_TURBO_END);
  const endTime = result[STORAGE_KEY_TURBO_END];

  if (typeof endTime === "number" && endTime > Date.now()) {
    return endTime;
  }

  return null;
}

/**
 * Enable turbo mode for the configured duration
 */
export async function enableTurboMode(): Promise<number> {
  const endTime = Date.now() + CONFIG.TURBO_DURATION_MINUTES * 60 * 1000;
  await browser.storage.local.set({ [STORAGE_KEY_TURBO_END]: endTime });
  return endTime;
}

/**
 * Disable turbo mode
 */
export async function disableTurboMode(): Promise<void> {
  await browser.storage.local.remove(STORAGE_KEY_TURBO_END);
}

/**
 * Get the total count of links opened
 */
export async function getOpenCount(): Promise<number> {
  const result = await browser.storage.local.get(STORAGE_KEY_OPEN_COUNT);
  const count = result[STORAGE_KEY_OPEN_COUNT];
  return typeof count === "number" ? count : 0;
}

/**
 * Increment the open count and store the last link
 */
export async function recordOpenedLink(url: string): Promise<number> {
  const currentCount = await getOpenCount();
  const newCount = currentCount + 1;
  await browser.storage.local.set({
    [STORAGE_KEY_OPEN_COUNT]: newCount,
    [STORAGE_KEY_LAST_LINK]: url,
  });
  return newCount;
}

/**
 * Get the last opened link
 */
export async function getLastOpenedLink(): Promise<string | null> {
  const result = await browser.storage.local.get(STORAGE_KEY_LAST_LINK);
  const link = result[STORAGE_KEY_LAST_LINK];
  return typeof link === "string" ? link : null;
}

export interface OpenStats {
  count: number;
  lastLink: string | null;
}

/**
 * Get open stats (count and last link)
 */
export async function getOpenStats(): Promise<OpenStats> {
  const result = await browser.storage.local.get([
    STORAGE_KEY_OPEN_COUNT,
    STORAGE_KEY_LAST_LINK,
  ]);
  return {
    count: typeof result[STORAGE_KEY_OPEN_COUNT] === "number" ? result[STORAGE_KEY_OPEN_COUNT] : 0,
    lastLink: typeof result[STORAGE_KEY_LAST_LINK] === "string" ? result[STORAGE_KEY_LAST_LINK] : null,
  };
}
