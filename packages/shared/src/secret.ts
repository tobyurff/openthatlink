import { DEFAULT_CONFIG } from "./config";

const {
  RECOGNIZABLE_TOKEN,
  SECRET_TOTAL_LEN,
  SECRET_INSERT_POS,
  NANOID_ALPHABET,
} = DEFAULT_CONFIG;

/**
 * Generate a random secret with embedded recognizable token.
 * Format: <random chars><TOKEN><random chars>
 * Example with OTL token at pos 8: "A2B3C4D5OTL6E7F8"
 */
export function generateSecret(
  alphabet: string = NANOID_ALPHABET,
  totalLen: number = SECRET_TOTAL_LEN,
  token: string = RECOGNIZABLE_TOKEN,
  insertPos: number = SECRET_INSERT_POS
): string {
  const randomPartLen = totalLen - token.length;
  const beforeLen = insertPos;
  const afterLen = randomPartLen - beforeLen;

  if (beforeLen < 0 || afterLen < 0) {
    throw new Error("Invalid secret configuration: lengths don't add up");
  }

  const randomChars = (len: number): string => {
    let result = "";
    const alphabetLen = alphabet.length;
    const randomValues = new Uint8Array(len);
    // Use crypto.getRandomValues in browser, or fallback for Node
    if (typeof globalThis.crypto !== "undefined") {
      globalThis.crypto.getRandomValues(randomValues);
    } else {
      // Fallback for older Node versions
      for (let i = 0; i < len; i++) {
        randomValues[i] = Math.floor(Math.random() * 256);
      }
    }
    for (let i = 0; i < len; i++) {
      result += alphabet[randomValues[i] % alphabetLen];
    }
    return result;
  };

  return randomChars(beforeLen) + token + randomChars(afterLen);
}

/**
 * Validate a secret matches the expected format.
 * Returns true if:
 * - Length matches SECRET_TOTAL_LEN
 * - Token exists at SECRET_INSERT_POS
 * - All characters are from the alphabet (excluding token chars)
 */
export function validateSecret(
  secret: string,
  alphabet: string = NANOID_ALPHABET,
  totalLen: number = SECRET_TOTAL_LEN,
  token: string = RECOGNIZABLE_TOKEN,
  insertPos: number = SECRET_INSERT_POS
): boolean {
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
 * Generic error message for invalid secrets.
 * Intentionally vague to avoid leaking validation details.
 */
export const INVALID_SECRET_ERROR =
  "Invalid endpoint. Install or reinstall the Chrome extension to generate a valid webhook URL.";
