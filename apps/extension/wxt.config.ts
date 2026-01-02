import { defineConfig } from "wxt";

export default defineConfig({
  // Use manifest version 3
  manifestVersion: 3,

  // Extension metadata
  manifest: {
    name: "OpenThat.Link",
    description:
      "Open links in your browser from Zapier, n8n, Make, or any webhook-capable tool.",
    version: "1.0.0",
    permissions: ["storage", "tabs", "alarms"],
    // Allow all HTTPS hosts for self-hosted instances
    host_permissions: ["https://*/*"],
    icons: {
      16: "/icon/16.png",
      32: "/icon/32.png",
      48: "/icon/48.png",
      128: "/icon/128.png",
    },
    action: {
      default_icon: {
        16: "/icon/16.png",
        32: "/icon/32.png",
        48: "/icon/48.png",
        128: "/icon/128.png",
      },
      default_title: "OpenThat.Link",
    },
  },

  // Output directory
  outDir: "dist",

  // Modules
  modules: [],

  // Dev server settings for devcontainer support
  dev: {
    server: {
      // Listen on all interfaces for devcontainer access
      host: "0.0.0.0",
      // Use a unique port (3003) to avoid conflicts with Next.js (3000)
      port: 3003,
    },
  },

  // Runner options for development
  runner: {
    // Disable auto-opening browser (doesn't work in devcontainer)
    disabled: true,
  },
});
