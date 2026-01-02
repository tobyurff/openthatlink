import { Redis as UpstashRedis } from "@upstash/redis";
import IORedis from "ioredis";
import { getConfig, QueueItem } from "@otl/shared";

const config = getConfig();

// Abstract interface for Redis operations we need
interface RedisClient {
  // Sorted set operations
  zadd(
    key: string,
    ...args: (string | number)[]
  ): Promise<number | null>;
  zrange(
    key: string,
    start: number,
    stop: number
  ): Promise<string[]>;
  zremrangebyrank(key: string, start: number, stop: number): Promise<number>;
  zremrangebyscore(
    key: string,
    min: number | string,
    max: number | string
  ): Promise<number>;
  zcard(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
}

// Get Upstash credentials from various env var naming conventions
function getUpstashCredentials(): { url: string; token: string } | null {
  // Try different naming conventions used by Vercel integrations
  const url = process.env.UPSTASH_REDIS_REST_URL
    || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
    || process.env.KV_REST_API_TOKEN;

  if (url && token) {
    return { url, token };
  }
  return null;
}

// Upstash Redis client (REST API based)
function createUpstashClient(url: string, token: string): RedisClient {
  const client = new UpstashRedis({ url, token });

  return {
    async zadd(key: string, ...args: (string | number)[]) {
      // Parse args: alternating score, member pairs
      // Upstash zadd expects individual score/member objects
      let count = 0;
      for (let i = 0; i < args.length; i += 2) {
        const result = await client.zadd(key, {
          score: Number(args[i]),
          member: String(args[i + 1]),
        });
        if (result) count += result;
      }
      return count;
    },
    async zrange(key: string, start: number, stop: number) {
      const result = await client.zrange(key, start, stop);
      return result as string[];
    },
    async zremrangebyrank(key: string, start: number, stop: number) {
      return client.zremrangebyrank(key, start, stop);
    },
    async zremrangebyscore(
      key: string,
      min: number | string,
      max: number | string
    ) {
      // Upstash expects specific type for min/max
      return client.zremrangebyscore(
        key,
        min as number | "-inf" | "+inf",
        max as number | "-inf" | "+inf"
      );
    },
    async zcard(key: string) {
      return client.zcard(key);
    },
    async expire(key: string, seconds: number) {
      const result = await client.expire(key, seconds);
      return result ? 1 : 0;
    },
  };
}

// IORedis client (TCP based, for local development)
function createIORedisClient(): RedisClient {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  const client = new IORedis(redisUrl);

  return {
    async zadd(key: string, ...args: (string | number)[]) {
      // ioredis expects: zadd(key, score1, member1, score2, member2, ...)
      const result = await client.zadd(key, ...args.map(String));
      return result;
    },
    async zrange(key: string, start: number, stop: number) {
      return client.zrange(key, start, stop);
    },
    async zremrangebyrank(key: string, start: number, stop: number) {
      return client.zremrangebyrank(key, start, stop);
    },
    async zremrangebyscore(
      key: string,
      min: number | string,
      max: number | string
    ) {
      return client.zremrangebyscore(key, min, max);
    },
    async zcard(key: string) {
      return client.zcard(key);
    },
    async expire(key: string, seconds: number) {
      return client.expire(key, seconds);
    },
  };
}

// Select client based on environment
let redisClient: RedisClient | null = null;

export function getRedis(): RedisClient {
  if (redisClient) {
    return redisClient;
  }

  // Use Upstash REST API if credentials are available (production on Vercel)
  // Fall back to IORedis for local development
  const upstashCreds = getUpstashCredentials();
  if (upstashCreds) {
    console.log("Using Upstash Redis client");
    redisClient = createUpstashClient(upstashCreds.url, upstashCreds.token);
  } else {
    console.log("Using IORedis client for local development");
    redisClient = createIORedisClient();
  }

  return redisClient;
}

// Queue operations
export function getQueueKey(secret: string): string {
  return `${config.QUEUE_KEY_PREFIX}${secret}`;
}

export async function cleanupOldItems(secret: string): Promise<void> {
  const redis = getRedis();
  const key = getQueueKey(secret);
  const cutoff = Date.now() - config.QUEUE_ITEM_TTL_SECONDS * 1000;
  await redis.zremrangebyscore(key, "-inf", cutoff);
}

export async function refreshExpiry(secret: string): Promise<void> {
  const redis = getRedis();
  const key = getQueueKey(secret);
  await redis.expire(key, config.QUEUE_ITEM_TTL_SECONDS);
}

export async function getQueueSize(secret: string): Promise<number> {
  const redis = getRedis();
  const key = getQueueKey(secret);
  return redis.zcard(key);
}

export async function enqueueLinks(
  secret: string,
  urls: string[]
): Promise<void> {
  const redis = getRedis();
  const key = getQueueKey(secret);
  const now = Date.now();

  for (let i = 0; i < urls.length; i++) {
    const item: QueueItem = {
      id: `${now}-${i}`,
      url: urls[i],
      ts: now,
    };
    await redis.zadd(key, now, JSON.stringify(item));
  }
}

export async function dequeueLinks(
  secret: string,
  maxCount: number
): Promise<string[]> {
  const redis = getRedis();
  const key = getQueueKey(secret);

  // Get the oldest items (lowest scores)
  const items = await redis.zrange(key, 0, maxCount - 1);

  if (items.length === 0) {
    return [];
  }

  // Remove the items we just retrieved
  await redis.zremrangebyrank(key, 0, items.length - 1);

  // Parse and return URLs
  return items.map((item) => {
    const parsed = JSON.parse(item) as QueueItem;
    return parsed.url;
  });
}
