# OpenThat.link

Open links in your browser from Zapier, n8n, or any webhook-capable automation tool.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftobyurff%2Fopenthatlink&project-name=openthatlink&repository-name=openthatlink&integration-ids=oac_V3R1GIpkoJorr6fqyiwdhl17)

## How it works

1. **Install the Chrome extension** - generates a unique webhook URL
2. **Copy your webhook URL** - shown in the extension popup
3. **Send links to the webhook** - from Zapier, n8n, or any tool
4. **Links open automatically** - in your browser within ~30 seconds

## Quick Start

### Deploy to Vercel (Recommended)

Click the "Deploy with Vercel" button above. During setup:

1. Connect your GitHub account
2. Configure the Upstash Redis integration (automatically provides Redis credentials)
3. Deploy!

That's it! All environment variables have sensible defaults. The app will auto-detect your Vercel URL.

### Local Development

```bash
# Clone the repository
git clone https://github.com/tobyurff/openthatlink.git
cd openthatlink

# Install dependencies
pnpm install

# Start Redis locally
redis-server

# Start the dev server
pnpm dev
```

## API Reference

### Enqueue Links

Add links to the queue for the Chrome extension to open.

```
GET /api/:secret?link=example.com
GET /api/:secret?link=a.com,b.com,c.com
POST /api/:secret with {"links": ["example.com", "other.com"]}
```

**Query Parameters:**
- `link` - Single URL or comma-separated URLs
- `links[]` - Array of URLs

**JSON Body:**
- `link` - Single URL string
- `links` - Array of URL strings

**Response:**
```json
{
  "ok": true,
  "queued": 2,
  "links": ["https://example.com/", "https://other.com/"],
  "message": "Queued 2 link(s)."
}
```

### Poll for Links (Extension)

Used by the Chrome extension to retrieve and consume queued links.

```
GET /api/:secret/extension-poll
```

**Response:**
```json
{
  "ok": true,
  "delivered": 2,
  "links": ["https://example.com/", "https://other.com/"]
}
```

## Environment Variables

All environment variables are optional and have sensible defaults.

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_NAME` | `My Personal OpenThat.Link` | Application name |
| `PUBLIC_BASE_URL` | Auto-detected from Vercel | Public URL of your deployment |
| `RECOGNIZABLE_TOKEN` | `OTL` | Token embedded in secrets |
| `SECRET_TOTAL_LEN` | `16` | Total length of generated secrets |
| `SECRET_INSERT_POS` | `8` | Position to insert token |
| `QUEUE_KEY_PREFIX` | `otl:q:` | Redis key prefix |
| `MAX_QUEUE_SIZE` | `100` | Max links per queue |
| `MAX_DELIVER_PER_POLL` | `10` | Max links returned per poll |
| `QUEUE_ITEM_TTL_SECONDS` | `172800` | Queue item TTL (2 days) |

### Redis Configuration

**For Vercel (Production):**
- `UPSTASH_REDIS_REST_URL` - Provided by Upstash integration
- `UPSTASH_REDIS_REST_TOKEN` - Provided by Upstash integration

**For Local Development:**
- `REDIS_URL` - Local Redis connection string (default: `redis://localhost:6379`)

## Project Structure

```
openthatlink/
├── apps/
│   ├── web/              # Next.js web app
│   └── extension/        # Chrome extension (coming soon)
├── packages/
│   └── shared/           # Shared types and utilities
├── .env.example
├── pnpm-workspace.yaml
└── README.md
```

## White-labeling

This project is designed to be easily white-labeled. Simply set the environment variables:

1. `APP_NAME` - Your custom app name
2. `PUBLIC_BASE_URL` - Your custom domain
3. `RECOGNIZABLE_TOKEN` - Your custom token (e.g., your initials)

## License

MIT
