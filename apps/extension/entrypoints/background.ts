import { CONFIG } from "@/utils/config";
import { getStoredSecret, getOrCreateSecret, getStoredBaseUrl } from "@/utils/storage";
import { getPollUrl } from "@/utils/secret";

const ALARM_NAME = "otl-poll";

interface PollResponse {
  ok: boolean;
  delivered?: number;
  links?: string[];
  error?: string;
}

/**
 * Poll the server for links to open
 */
async function pollForLinks(): Promise<void> {
  const secret = await getStoredSecret();

  if (!secret) {
    console.log("[OTL] No secret found, skipping poll");
    return;
  }

  const baseUrl = await getStoredBaseUrl();
  const pollUrl = getPollUrl(secret, baseUrl);

  try {
    const response = await fetch(pollUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error("[OTL] Poll failed with status:", response.status);
      return;
    }

    const data: PollResponse = await response.json();

    if (!data.ok) {
      console.error("[OTL] Poll returned error:", data.error);
      return;
    }

    const links = data.links ?? [];

    if (links.length === 0) {
      // No links to open, this is normal
      return;
    }

    console.log(`[OTL] Opening ${links.length} link(s)`);

    // Open each link in a new tab
    for (const url of links) {
      try {
        await browser.tabs.create({ url, active: false });
      } catch (err) {
        console.error("[OTL] Failed to open tab:", url, err);
      }
    }
  } catch (err) {
    console.error("[OTL] Poll request failed:", err);
  }
}

/**
 * Set up the polling alarm
 */
async function setupAlarm(): Promise<void> {
  // Clear any existing alarm
  await browser.alarms.clear(ALARM_NAME);

  // Create a new alarm
  // periodInMinutes minimum is 0.5 (30 seconds) for MV3
  await browser.alarms.create(ALARM_NAME, {
    periodInMinutes: CONFIG.POLL_INTERVAL_MINUTES,
    // Start immediately (within the first period)
    delayInMinutes: 0.05, // ~3 seconds initial delay
  });

  console.log(
    `[OTL] Polling alarm set for every ${CONFIG.POLL_INTERVAL_MINUTES * 60} seconds`
  );
}

// Listen for alarm events
browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    pollForLinks();
  }
});

// On extension install/update
export default defineBackground(() => {
  // Handle install and update events
  browser.runtime.onInstalled.addListener(async (details) => {
    console.log("[OTL] Extension installed/updated:", details.reason);

    // Ensure we have a secret
    await getOrCreateSecret();

    // Set up polling
    await setupAlarm();

    // Open onboarding page on fresh install
    if (details.reason === "install") {
      // Open the popup/options page
      const url = browser.runtime.getURL("/popup.html");
      await browser.tabs.create({ url, active: true });
    }
  });

  // Handle browser startup (extension was already installed)
  browser.runtime.onStartup.addListener(async () => {
    console.log("[OTL] Browser started, setting up alarm");
    await setupAlarm();
  });

  // Also set up alarm immediately in case service worker was killed and restarted
  setupAlarm();

  console.log("[OTL] Background script initialized");
});
