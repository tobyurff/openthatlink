import { NextRequest, NextResponse } from "next/server";
import {
  validateSecret,
  extractLinksFromRequest,
  getConfig,
  INVALID_SECRET_ERROR,
  EnqueueResponse,
  DocsInfo,
} from "@otl/shared";
import {
  cleanupOldItems,
  refreshExpiry,
  getQueueSize,
  enqueueLinks,
} from "@/lib/redis";

const config = getConfig();

function getDocs(secret?: string): DocsInfo {
  const isValidSecret = secret && validateSecret(secret);
  return {
    hyperlink: isValidSecret
      ? `${config.PUBLIC_BASE_URL}/#${secret}`
      : config.PUBLIC_BASE_URL,
    note: "Want to know how to use this tool to open links in your local browser from automation tools like n8n, Zapier, your own code, or anywhere you can trigger webhooks?",
  };
}

function formatLinkCount(count: number): string {
  return count === 1 ? "one link" : `${count} links`;
}

function jsonResponse(data: EnqueueResponse, status: number = 200) {
  return NextResponse.json(data, { status });
}

async function handleEnqueue(
  request: NextRequest,
  token: string
): Promise<NextResponse> {
  // Validate secret (token is the secret)
  if (!validateSecret(token)) {
    return jsonResponse(
      {
        ok: false,
        error: INVALID_SECRET_ERROR,
        docs: getDocs(),
      },
      400
    );
  }

  // Parse query params
  const url = new URL(request.url);
  const query: Record<string, unknown> = {};
  url.searchParams.forEach((value, key) => {
    // Handle array params like link[] or links[]
    if (key.endsWith("[]")) {
      const baseKey = key.slice(0, -2);
      if (!query[baseKey]) {
        query[baseKey] = [];
      }
      (query[baseKey] as string[]).push(value);
    } else if (query[key]) {
      // Multiple values for same key become array
      if (Array.isArray(query[key])) {
        (query[key] as string[]).push(value);
      } else {
        query[key] = [query[key] as string, value];
      }
    } else {
      query[key] = value;
    }
  });

  // Parse body if present
  let body: Record<string, unknown> | null = null;
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      body = await request.json();
    } catch {
      // Ignore JSON parse errors
    }
  }

  // Extract links from query and body
  const links = extractLinksFromRequest(query, body);

  if (links.length === 0) {
    return jsonResponse(
      {
        ok: false,
        error:
          'Missing link(s). Provide ?link=example.com or POST {"links":[...]}',
        examples: [
          `${config.PUBLIC_BASE_URL}/<SECRET>?link=example.com`,
          `curl -X POST ${config.PUBLIC_BASE_URL}/<SECRET> -H 'content-type: application/json' -d '{"links":["example.com"]}'`,
        ],
        docs: getDocs(token),
      },
      400
    );
  }

  // Cleanup old items first
  await cleanupOldItems(token);

  // Check queue size
  const currentSize = await getQueueSize(token);
  const incomingCount = links.length;

  if (currentSize + incomingCount > config.MAX_QUEUE_SIZE) {
    return jsonResponse(
      {
        ok: false,
        error:
          "Queue limit reached for this endpoint. Wait for delivery or reduce incoming links.",
        limit: config.MAX_QUEUE_SIZE,
        docs: getDocs(token),
      },
      429
    );
  }

  // Enqueue links
  await enqueueLinks(token, links);

  // Refresh key expiry
  await refreshExpiry(token);

  return jsonResponse({
    ok: true,
    queued: links.length,
    links,
    message: `Queued ${formatLinkCount(links.length)} to be opened in your browser.`,
    docs: getDocs(token),
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  return handleEnqueue(request, params.token);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  return handleEnqueue(request, params.token);
}
