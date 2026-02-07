import { defineConfig } from "wxt";

export default defineConfig({
  // Use manifest version 3
  manifestVersion: 3,

  // Extension metadata - using function to conditionally add Firefox-specific settings
  manifest: (env) => ({
    name: "OpenThat.Link",
    description:
      "Open links in your browser from Zapier, n8n, Make, or any webhook-capable tool.",
    version: "1.0.1",
    permissions: ["storage", "alarms"],
    // Only require openthat.link by default
    host_permissions: ["https://openthat.link/*"],
    // Allow requesting permission for self-hosted servers dynamically
    optional_host_permissions: ["https://*/*", "http://*/*"],
    icons: {
      16: "/icon/16.png",
      32: "/icon/32.png",
      48: "/icon/48.png",
      128: "/icon/128.png",
    },
    action: {
      default_icon: {
        16: "/icon-toolbar/16.png",
        32: "/icon-toolbar/32.png",
        48: "/icon-toolbar/48.png",
        128: "/icon-toolbar/128.png",
      },
      default_title: "OpenThat.Link",
    },
    // Firefox-specific settings (required for MV3)
    ...(env.browser === "firefox" && {
      browser_specific_settings: {
        gecko: {
          id: "extension@openthat.link",
          strict_min_version: "109.0",
          data_collection_permissions: {
            required: ["none"],
          },
        },
      },
    }),
  }),

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
