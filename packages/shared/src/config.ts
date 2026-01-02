// Default configuration values - can be overridden via environment variables

export const DEFAULT_CONFIG = {
  // App branding
  APP_NAME: "OpenThat.link",
  PUBLIC_BASE_URL: "https://openthat.link",

  // Secret format
  RECOGNIZABLE_TOKEN: "OTL",
  SECRET_TOTAL_LEN: 16,
  SECRET_INSERT_POS: 8,
  NANOID_ALPHABET: "23456789ABCDEFGHJKLMNPQRSTUVWXYZ",

  // Queue settings
  QUEUE_KEY_PREFIX: "otl:q:",
  MAX_QUEUE_SIZE: 100,
  MAX_DELIVER_PER_POLL: 10,
  QUEUE_ITEM_TTL_SECONDS: 172800, // 2 days

  // Extension polling
  POLL_INTERVAL_SECONDS: 30,
};

export interface Config {
  APP_NAME: string;
  PUBLIC_BASE_URL: string;
  RECOGNIZABLE_TOKEN: string;
  SECRET_TOTAL_LEN: number;
  SECRET_INSERT_POS: number;
  NANOID_ALPHABET: string;
  QUEUE_KEY_PREFIX: string;
  MAX_QUEUE_SIZE: number;
  MAX_DELIVER_PER_POLL: number;
  QUEUE_ITEM_TTL_SECONDS: number;
  POLL_INTERVAL_SECONDS: number;
}

export function getConfig(): Config {
  return {
    APP_NAME: process.env.APP_NAME ?? DEFAULT_CONFIG.APP_NAME,
    PUBLIC_BASE_URL:
      process.env.PUBLIC_BASE_URL ?? DEFAULT_CONFIG.PUBLIC_BASE_URL,
    RECOGNIZABLE_TOKEN:
      process.env.RECOGNIZABLE_TOKEN ?? DEFAULT_CONFIG.RECOGNIZABLE_TOKEN,
    SECRET_TOTAL_LEN: process.env.SECRET_TOTAL_LEN
      ? parseInt(process.env.SECRET_TOTAL_LEN, 10)
      : DEFAULT_CONFIG.SECRET_TOTAL_LEN,
    SECRET_INSERT_POS: process.env.SECRET_INSERT_POS
      ? parseInt(process.env.SECRET_INSERT_POS, 10)
      : DEFAULT_CONFIG.SECRET_INSERT_POS,
    NANOID_ALPHABET:
      process.env.NANOID_ALPHABET ?? DEFAULT_CONFIG.NANOID_ALPHABET,
    QUEUE_KEY_PREFIX:
      process.env.QUEUE_KEY_PREFIX ?? DEFAULT_CONFIG.QUEUE_KEY_PREFIX,
    MAX_QUEUE_SIZE: process.env.MAX_QUEUE_SIZE
      ? parseInt(process.env.MAX_QUEUE_SIZE, 10)
      : DEFAULT_CONFIG.MAX_QUEUE_SIZE,
    MAX_DELIVER_PER_POLL: process.env.MAX_DELIVER_PER_POLL
      ? parseInt(process.env.MAX_DELIVER_PER_POLL, 10)
      : DEFAULT_CONFIG.MAX_DELIVER_PER_POLL,
    QUEUE_ITEM_TTL_SECONDS: process.env.QUEUE_ITEM_TTL_SECONDS
      ? parseInt(process.env.QUEUE_ITEM_TTL_SECONDS, 10)
      : DEFAULT_CONFIG.QUEUE_ITEM_TTL_SECONDS,
    POLL_INTERVAL_SECONDS: process.env.POLL_INTERVAL_SECONDS
      ? parseInt(process.env.POLL_INTERVAL_SECONDS, 10)
      : DEFAULT_CONFIG.POLL_INTERVAL_SECONDS,
  };
}
