# OpenThat.Link Browser Extension

Browser extension that polls for links from your webhook and opens them automatically.

Built with [WXT](https://wxt.dev/) for cross-browser support (Chrome, Firefox, Edge).

## Features

- Generates a unique secret/webhook URL on install
- Polls every 30 seconds for new links
- Opens links in new tabs automatically
- Supports self-hosted instances via Advanced Configuration
- Cross-browser: Chrome, Firefox, Edge (same codebase)

## Installation

### From Store (Recommended)

- **Chrome Web Store**: Coming soon
- **Firefox Add-ons**: Coming soon

### Manual Installation

#### Chrome / Edge

1. Download or build the extension (see [Development](#development))
2. Open `chrome://extensions/` (or `edge://extensions/`)
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the `dist/chrome-mv3` folder

#### Firefox

1. Download or build the extension
2. Open `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on**
4. Select `dist/firefox-mv3/manifest.json`

## Usage

1. Click the extension icon in your toolbar
2. Copy your webhook URL
3. Send links to the webhook from any automation tool:

```bash
# Simple GET request
curl "https://openthat.link/api/YOUR_SECRET?link=example.com"

# POST with JSON
curl -X POST https://openthat.link/api/YOUR_SECRET \
  -H "Content-Type: application/json" \
  -d '{"links": ["https://example.com"]}'

# Multiple links
curl "https://openthat.link/api/YOUR_SECRET?link=a.com,b.com,c.com"
```

4. Links open in your browser within ~30 seconds

## Self-Hosting

If you've deployed your own OpenThat.Link instance:

1. Click the extension icon
2. Expand **Advanced Configuration**
3. Enter your server URL (e.g., `https://myserver.com`)
4. Click **Save Configuration**

The extension will now poll your self-hosted server instead.

## Development

### Prerequisites

- Node.js 18+
- pnpm 9+

### Setup

```bash
# From the monorepo root
pnpm install

# Start development mode
pnpm ext:dev          # Chrome
pnpm ext:dev:firefox  # Firefox
```

### Build

```bash
pnpm ext:build           # Chrome production build
pnpm ext:build:firefox   # Firefox production build
pnpm ext:build:all       # Both browsers

pnpm ext:zip             # Chrome + zip for store submission
pnpm ext:zip:all         # Both browsers + zips
```

### Output

```
apps/extension/
├── dist/
│   ├── chrome-mv3/                    # Chrome unpacked extension
│   ├── firefox-mv3/                   # Firefox unpacked extension
│   ├── otlextension-1.0.0-chrome.zip  # Chrome Web Store ready
│   ├── otlextension-1.0.0-firefox.zip # Firefox Add-ons ready
│   └── otlextension-1.0.0-sources.zip # Source code (for Firefox review)
```

### Devcontainer / Docker Development

When developing inside a devcontainer:

1. **Configure WXT** (already done in this repo):
   ```ts
   // wxt.config.ts
   export default defineConfig({
     dev: {
       server: {
         host: "0.0.0.0", // Listen on all interfaces
       },
     },
     runner: {
       disabled: true, // Don't auto-open browser
     },
   });
   ```

2. **Start the dev server** in the container:
   ```bash
   pnpm ext:dev
   ```

3. **Load the extension** from your host machine:
   - Your project folder syncs between container and host (VS Code handles this)
   - Open Chrome on your Mac/PC
   - Go to `chrome://extensions/`
   - Load unpacked from your local path to `apps/extension/dist/chrome-mv3`

4. **Hot reload** works via port forwarding:
   - VS Code forwards port 3000 from container to host
   - Popup UI changes reload automatically
   - Background script changes require clicking refresh in `chrome://extensions/`

## Project Structure

```
apps/extension/
├── entrypoints/
│   ├── background.ts      # Service worker (polling logic)
│   └── popup/
│       ├── index.html     # Popup UI
│       └── main.ts        # Popup logic
├── utils/
│   ├── config.ts          # Extension configuration
│   ├── secret.ts          # Secret generation/validation
│   └── storage.ts         # Chrome storage helpers
├── public/
│   └── icon/              # Extension icons (16, 32, 48, 128px)
├── wxt.config.ts          # WXT configuration
└── package.json
```

## How Polling Works

1. On install, the extension generates a random secret with embedded token (e.g., `A2B3C4D5OTL6E7F8`)
2. A `chrome.alarms` alarm fires every 30 seconds (MV3 minimum)
3. The background service worker calls `GET /api/:secret/extension-poll`
4. The server returns queued links and removes them from the queue
5. The extension opens each link in a new tab

## Permissions

| Permission | Reason |
|------------|--------|
| `storage` | Store your secret and configuration locally |
| `tabs` | Open new tabs when links arrive |
| `alarms` | Schedule polling every 30 seconds |
| `host_permissions: https://*/*` | Connect to openthat.link or self-hosted servers |

## Troubleshooting

### Links not opening?

1. Check the extension icon - it should be visible in your toolbar
2. Open the extension popup - your webhook URL should be displayed
3. Check browser console for errors (right-click extension icon > Inspect)
4. Verify your server is running and accessible

### Self-hosted server not working?

1. Ensure your server URL is correct (include `https://`)
2. Check that CORS allows requests from browser extensions
3. Verify the `/api/:secret/extension-poll` endpoint returns valid JSON

### Extension not polling?

1. Chrome MV3 service workers can be suspended - this is normal
2. The alarm will wake up the service worker every 30 seconds
3. Check `chrome://extensions/` > OpenThat.Link > "Service worker" link for logs
