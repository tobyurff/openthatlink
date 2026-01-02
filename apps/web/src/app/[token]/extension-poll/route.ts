import { NextRequest, NextResponse } from "next/server";
import {
  validateSecret,
  getConfig,
  INVALID_SECRET_ERROR,
  PollResponse,
} from "@otl/shared";
import { cleanupOldItems, refreshExpiry, dequeueLinks } from "@/lib/redis";

const config = getConfig();

function jsonResponse(data: PollResponse, status: number = 200) {
  return NextResponse.json(data, { status });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const { token } = params;

  // Validate secret (token is the secret)
  if (!validateSecret(token)) {
    return jsonResponse(
      {
        ok: false,
        error: INVALID_SECRET_ERROR,
      },
      400
    );
  }

  // Cleanup old items first
  await cleanupOldItems(token);

  // Dequeue links
  const links = await dequeueLinks(token, config.MAX_DELIVER_PER_POLL);

  // Refresh key expiry if there are still items
  if (links.length > 0) {
    await refreshExpiry(token);
  }

  return jsonResponse({
    ok: true,
    delivered: links.length,
    links,
  });
}
