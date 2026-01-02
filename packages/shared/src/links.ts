/**
 * Normalize a URL string:
 * - Trim whitespace
 * - Add https:// if missing scheme
 * - Validate only http: or https: schemes
 * Returns null if invalid
 */
export function normalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  let url = trimmed;

  // Add https:// if no scheme
  if (!url.includes("://")) {
    url = "https://" + url;
  }

  try {
    const parsed = new URL(url);

    // Only allow http and https
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }

    // Return the normalized URL string
    return parsed.href;
  } catch {
    return null;
  }
}

/**
 * Parse links from various input formats.
 * Supports:
 * - Single string
 * - Comma-separated string
 * - Array of strings
 * Returns normalized, de-duplicated URLs
 */
export function parseLinks(input: unknown): string[] {
  const urls: string[] = [];

  if (typeof input === "string") {
    // Handle comma-separated values
    const parts = input.split(",");
    for (const part of parts) {
      const normalized = normalizeUrl(part);
      if (normalized) {
        urls.push(normalized);
      }
    }
  } else if (Array.isArray(input)) {
    for (const item of input) {
      if (typeof item === "string") {
        const normalized = normalizeUrl(item);
        if (normalized) {
          urls.push(normalized);
        }
      }
    }
  }

  // De-duplicate
  return [...new Set(urls)];
}

/**
 * Extract links from request query and body.
 * Accepts various formats:
 * Query: ?link=a.com or ?link=a.com,b.com or ?links[]=a.com&links[]=b.com
 * Body: { link: "a.com" } or { links: ["a.com", "b.com"] }
 */
export function extractLinksFromRequest(
  query: Record<string, unknown>,
  body: Record<string, unknown> | null
): string[] {
  const allLinks: string[] = [];

  // From query: link, links, link[], links[]
  const queryLink = query.link ?? query["link[]"];
  const queryLinks = query.links ?? query["links[]"];

  if (queryLink) {
    allLinks.push(...parseLinks(queryLink));
  }
  if (queryLinks) {
    allLinks.push(...parseLinks(queryLinks));
  }

  // From body: link, links
  if (body) {
    if (body.link) {
      allLinks.push(...parseLinks(body.link));
    }
    if (body.links) {
      allLinks.push(...parseLinks(body.links));
    }
  }

  // De-duplicate across query and body
  return [...new Set(allLinks)];
}
