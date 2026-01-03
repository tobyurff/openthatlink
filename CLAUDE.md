# Claude Code Reference

Quick reference for navigating the OpenThat.Link monorepo.

## Project Overview

OpenThat.Link allows you to open links in your browser from Zapier, n8n, or any webhook-capable automation tool.

## Documentation Index

| Location | Description |
|----------|-------------|
| [README.md](README.md) | Main project docs: setup, API reference, environment variables, deployment |
| [apps/extension/README.md](apps/extension/README.md) | Browser extension (WXT): installation, dev mode, self-hosting, troubleshooting |

## Project Structure

```
openthatlink/
├── apps/
│   ├── web/           # Next.js web app (API + landing page)
│   └── extension/     # Browser extension (Chrome, Firefox, Edge) - built with WXT
├── packages/
│   ├── shared/        # Shared types and utilities (@otl/shared)
│   └── assets/        # Shared assets
```

## Quick Commands

### From monorepo root

```bash
pnpm install          # Install all dependencies
pnpm dev              # Start web app dev server
pnpm ext:dev          # Start extension dev mode (Chrome)
pnpm ext:dev:firefox  # Start extension dev mode (Firefox)
pnpm build            # Build web app
pnpm ext:build:all    # Build extension for all browsers
```

### From apps/extension/

```bash
npm install           # Install extension dependencies
npm run dev           # Start dev mode (Chrome)
npm run dev:firefox   # Start dev mode (Firefox)
npm run build         # Build for Chrome
```

### From apps/web/

```bash
npm run dev           # Start Next.js dev server
npm run build         # Build for production
```

## Key Technologies

- **Web App**: Next.js 14, Upstash Redis
- **Extension**: WXT framework (https://wxt.dev/), TypeScript
- **Monorepo**: pnpm workspaces
