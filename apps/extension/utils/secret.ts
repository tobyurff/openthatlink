import { CONFIG } from "./config";

const { RECOGNIZABLE_TOKEN, SECRET_TOTAL_LEN, SECRET_INSERT_POS, NANOID_ALPHABET } =
  CONFIG;

/**
 * Generate a random secret with embedded recognizable token.
 * Format: <random chars><TOKEN><random chars>
 * Example with OTL token at pos 8: "A2B3C4D5OTL6E7F8"
 */
export function generateSecret(): string {
  const token = RECOGNIZABLE_TOKEN;
  const totalLen = SECRET_TOTAL_LEN;
  const insertPos = SECRET_INSERT_POS;
  const alphabet = NANOID_ALPHABET;

  const randomPartLen = totalLen - token.length;
  const beforeLen = insertPos;
  const afterLen = randomPartLen - beforeLen;

  const randomChars = (len: number): string => {
    let result = "";
    const alphabetLen = alphabet.length;
    const randomValues = new Uint8Array(len);
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < len; i++) {
      result += alphabet[randomValues[i] % alphabetLen];
    }
    return result;
  };

  return randomChars(beforeLen) + token + randomChars(afterLen);
}

/**
 * Validate a secret matches the expected format.
 */
export function validateSecret(secret: string): boolean {
  const token = RECOGNIZABLE_TOKEN;
  const totalLen = SECRET_TOTAL_LEN;
  const insertPos = SECRET_INSERT_POS;
  const alphabet = NANOID_ALPHABET;

  // Check length
  if (secret.length !== totalLen) {
    return false;
  }

  // Check token at correct position
  const tokenInSecret = secret.slice(insertPos, insertPos + token.length);
  if (tokenInSecret !== token) {
    return false;
  }

  // Check all non-token characters are from alphabet
  const beforeToken = secret.slice(0, insertPos);
  const afterToken = secret.slice(insertPos + token.length);
  const randomPart = beforeToken + afterToken;

  for (const char of randomPart) {
    if (!alphabet.includes(char)) {
      return false;
    }
  }

  return true;
}

/**
 * Build the webhook URL from a secret and optional custom base URL
 */
export function getWebhookUrl(secret: string, baseUrl?: string): string {
  const base = baseUrl ?? CONFIG.PUBLIC_BASE_URL;
  return `${base}/api/${secret}`;
}

/**
 * Build the poll URL from a secret and optional custom base URL
 */
export function getPollUrl(secret: string, baseUrl?: string): string {
  const base = baseUrl ?? CONFIG.PUBLIC_BASE_URL;
  return `${base}/api/${secret}/extension-poll`;
}
