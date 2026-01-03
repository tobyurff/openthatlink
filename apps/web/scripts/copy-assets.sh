#!/bin/bash
# Copy shared assets from packages/assets to public/ for production builds
# This replaces symlinks which don't work in Vercel deployments

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_DIR="$(dirname "$SCRIPT_DIR")"
ASSETS_DIR="$WEB_DIR/../../packages/assets"
PUBLIC_DIR="$WEB_DIR/public"

echo "Copying assets from packages/assets to public/..."

cp "$ASSETS_DIR/icons/favicon.ico" "$PUBLIC_DIR/favicon.ico"
cp "$ASSETS_DIR/icons/apple-touch-icon.png" "$PUBLIC_DIR/apple-touch-icon.png"
cp "$ASSETS_DIR/logo/logo.svg" "$PUBLIC_DIR/logo.svg"
cp "$ASSETS_DIR/social/og-image.png" "$PUBLIC_DIR/og-image.png"

echo "Assets copied successfully."
