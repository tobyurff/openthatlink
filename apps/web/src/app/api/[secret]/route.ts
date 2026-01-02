import { NextRequest, NextResponse } from "next/server";
import {
  validateSecret,
  extractLinksFromRequest,
  getConfig,
  INVALID_SECRET_ERROR,
  EnqueueResponse,
} from "@otl/shared";
import {
  cleanupOldItems,
  refreshExpiry,
  getQueueSize,
  enqueueLinks,
} from "@/lib/redis";

const config = getConfig();

function jsonResponse(data: EnqueueResponse, status: number = 200) {
  return NextResponse.json(data, { status });
}

async function handleEnqueue(
  request: NextRequest,
  secret: string
): Promise<NextResponse> {
  // Validate secret
  if (!validateSecret(secret)) {
    return jsonResponse(
      {
        ok: false,
        error: INVALID_SECRET_ERROR,
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
          `${config.PUBLIC_BASE_URL}/api/<SECRET>?link=example.com`,
          `curl -X POST ${config.PUBLIC_BASE_URL}/api/<SECRET> -H 'content-type: application/json' -d '{"links":["example.com"]}'`,
        ],
      },
      400
    );
  }

  // Cleanup old items first
  await cleanupOldItems(secret);

  // Check queue size
  const currentSize = await getQueueSize(secret);
  const incomingCount = links.length;

  if (currentSize + incomingCount > config.MAX_QUEUE_SIZE) {
    return jsonResponse(
      {
        ok: false,
        error:
          "Queue limit reached for this endpoint. Wait for delivery or reduce incoming links.",
        limit: config.MAX_QUEUE_SIZE,
      },
      429
    );
  }

  // Enqueue links
  await enqueueLinks(secret, links);

  // Refresh key expiry
  await refreshExpiry(secret);

  return jsonResponse({
    ok: true,
    queued: links.length,
    links,
    message: `Queued ${links.length} link(s).`,
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { secret: string } }
) {
  return handleEnqueue(request, params.secret);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { secret: string } }
) {
  return handleEnqueue(request, params.secret);
}
