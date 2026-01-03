// Default configuration values - can be overridden via environment variables

// Vercel provides these automatically
const VERCEL_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  || process.env.VERCEL_URL
  || null;

export const DEFAULT_CONFIG = {
  // App branding
  APP_NAME: "OpenThat.Link",
  PUBLIC_BASE_URL: VERCEL_URL ? `https://${VERCEL_URL}` : "http://localhost:3000",

  // External links (for white-labeling)
  CHROME_EXTENSION_URL: "https://chromewebstore.google.com/detail/enfmlabiopdgghghdlkckfeobnfeafio",
  FIREFOX_EXTENSION_URL: "https://addons.mozilla.org/firefox/addon/openthatlink/",
  GITHUB_URL: "https://github.com/tobyurff/openthatlink",

  // Company info (for footer)
  COMPANY_NAME: "Unstuckable OÜ",
  COMPANY_ADDRESS: "Sepapaja 6, Tallinn 15551, Estonia",
  CONTACT_EMAIL: "toby-socilo@unstuckable.eu",

  // Secret format
  RECOGNIZABLE_TOKEN: "OTL",
  SECRET_TOTAL_LEN: 16,
  SECRET_INSERT_POS: 8,
  NANOID_ALPHABET: "23456789ABCDEFGHJKLMNPQRSTUVWXYZ",

  // Queue settings
  QUEUE_KEY_PREFIX: "otl:q:",
  MAX_QUEUE_SIZE: 100,
  MAX_DELIVER_PER_POLL: 10,
  QUEUE_ITEM_TTL_SECONDS: 259200, // 3 days

  // Extension polling
  POLL_INTERVAL_SECONDS: 30,
};

export interface Config {
  APP_NAME: string;
  PUBLIC_BASE_URL: string;
  CHROME_EXTENSION_URL: string;
  FIREFOX_EXTENSION_URL: string;
  GITHUB_URL: string;
  COMPANY_NAME: string;
  COMPANY_ADDRESS: string;
  CONTACT_EMAIL: string;
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
    CHROME_EXTENSION_URL:
      process.env.CHROME_EXTENSION_URL ?? DEFAULT_CONFIG.CHROME_EXTENSION_URL,
    FIREFOX_EXTENSION_URL:
      process.env.FIREFOX_EXTENSION_URL ?? DEFAULT_CONFIG.FIREFOX_EXTENSION_URL,
    GITHUB_URL: process.env.GITHUB_URL ?? DEFAULT_CONFIG.GITHUB_URL,
    COMPANY_NAME: process.env.COMPANY_NAME ?? DEFAULT_CONFIG.COMPANY_NAME,
    COMPANY_ADDRESS:
      process.env.COMPANY_ADDRESS ?? DEFAULT_CONFIG.COMPANY_ADDRESS,
    CONTACT_EMAIL: process.env.CONTACT_EMAIL ?? DEFAULT_CONFIG.CONTACT_EMAIL,
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
