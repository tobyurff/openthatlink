// Extension configuration - matches the server defaults
// These are hardcoded since the extension runs in the browser

export const CONFIG = {
  // App branding
  APP_NAME: "OpenThat.Link",
  PUBLIC_BASE_URL: "https://openthat.link",

  // Secret format (must match server)
  RECOGNIZABLE_TOKEN: "OTL",
  SECRET_TOTAL_LEN: 16,
  SECRET_INSERT_POS: 8,
  NANOID_ALPHABET: "23456789ABCDEFGHJKLMNPQRSTUVWXYZ",

  // Polling settings
  // Chrome MV3 alarms minimum is 30 seconds for periodic, but we can chain one-time alarms
  POLL_INTERVAL_MINUTES: 1, // 60 seconds (normal mode)
  TURBO_POLL_INTERVAL_MINUTES: 1 / 6, // 10 seconds (turbo mode - uses chained one-time alarms)
  TURBO_DURATION_MINUTES: 5, // Turbo mode lasts 5 minutes

  // Storage keys
  STORAGE_KEY_SECRET: "otl_secret",
  STORAGE_KEY_TURBO_END: "otl_turbo_end", // Timestamp when turbo mode expires
  STORAGE_KEY_OPEN_COUNT: "otl_open_count", // Total links opened
  STORAGE_KEY_LAST_LINK: "otl_last_link", // Last opened link
} as const;

export type Config = typeof CONFIG;
