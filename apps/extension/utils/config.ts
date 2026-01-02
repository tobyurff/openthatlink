// Extension configuration - matches the server defaults
// These are hardcoded since the extension runs in the browser

export const CONFIG = {
  // App branding
  APP_NAME: "OpenThat.link",
  PUBLIC_BASE_URL: "https://openthat.link",

  // Secret format (must match server)
  RECOGNIZABLE_TOKEN: "OTL",
  SECRET_TOTAL_LEN: 16,
  SECRET_INSERT_POS: 8,
  NANOID_ALPHABET: "23456789ABCDEFGHJKLMNPQRSTUVWXYZ",

  // Polling settings
  // Chrome MV3 alarms minimum is 30 seconds
  POLL_INTERVAL_MINUTES: 0.5, // 30 seconds (minimum allowed)

  // Storage keys
  STORAGE_KEY_SECRET: "otl_secret",
} as const;

export type Config = typeof CONFIG;
