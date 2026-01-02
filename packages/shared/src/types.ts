// Queue item stored in Redis
export interface QueueItem {
  id: string;
  url: string;
  ts: number; // Unix timestamp in ms
}

// Documentation object included in API responses
export interface DocsInfo {
  hyperlink: string;
  note: string;
}

// API responses
export interface EnqueueSuccessResponse {
  ok: true;
  queued: number;
  links: string[];
  message: string;
  docs: DocsInfo;
}

export interface PollSuccessResponse {
  ok: true;
  delivered: number;
  links: string[];
}

export interface ErrorResponse {
  ok: false;
  error: string;
  examples?: string[];
  limit?: number;
  docs?: DocsInfo;
}

export type EnqueueResponse = EnqueueSuccessResponse | ErrorResponse;
export type PollResponse = PollSuccessResponse | ErrorResponse;
