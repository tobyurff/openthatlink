import { CONFIG } from "@/utils/config";
import {
  getStoredSecret,
  getOrCreateSecret,
  getStoredBaseUrl,
  isTurboModeActive,
  getTurboEndTime,
  recordOpenedLink,
} from "@/utils/storage";
import { getPollUrl } from "@/utils/secret";

const ALARM_NAME = "otl-poll";
const TURBO_ALARM_NAME = "otl-turbo-poll";

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
        await recordOpenedLink(url);
      } catch (err) {
        console.error("[OTL] Failed to open tab:", url, err);
      }
    }
  } catch (err) {
    console.error("[OTL] Poll request failed:", err);
  }
}

/**
 * Set up the normal polling alarm (1 minute interval)
 */
async function setupNormalAlarm(): Promise<void> {
  // Clear any existing alarms
  await browser.alarms.clear(ALARM_NAME);

  // Create a periodic alarm for normal mode
  await browser.alarms.create(ALARM_NAME, {
    periodInMinutes: CONFIG.POLL_INTERVAL_MINUTES,
    delayInMinutes: 0.05, // ~3 seconds initial delay
  });

  console.log(
    `[OTL] Normal polling alarm set for every ${CONFIG.POLL_INTERVAL_MINUTES * 60} seconds`
  );
}

/**
 * Schedule the next turbo mode poll (chained one-time alarms for 10s intervals)
 */
async function scheduleTurboPoll(): Promise<void> {
  const turboEndTime = await getTurboEndTime();

  if (!turboEndTime || Date.now() >= turboEndTime) {
    // Turbo mode expired, switch back to normal
    console.log("[OTL] Turbo mode expired, switching to normal polling");
    await browser.alarms.clear(TURBO_ALARM_NAME);
    await setupNormalAlarm();
    return;
  }

  // Schedule next turbo poll (10 seconds)
  await browser.alarms.create(TURBO_ALARM_NAME, {
    delayInMinutes: CONFIG.TURBO_POLL_INTERVAL_MINUTES,
  });
}

/**
 * Set up the appropriate polling based on turbo mode state
 */
async function setupAlarm(): Promise<void> {
  const turboActive = await isTurboModeActive();

  if (turboActive) {
    // Clear normal alarm and start turbo polling
    await browser.alarms.clear(ALARM_NAME);
    console.log("[OTL] Turbo mode active - polling every 10 seconds");
    await pollForLinks(); // Poll immediately
    await scheduleTurboPoll();
  } else {
    // Clear turbo alarm and set up normal polling
    await browser.alarms.clear(TURBO_ALARM_NAME);
    await setupNormalAlarm();
  }
}

// Listen for alarm events
browser.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    // Normal polling
    pollForLinks();
  } else if (alarm.name === TURBO_ALARM_NAME) {
    // Turbo mode polling - poll and schedule next
    await pollForLinks();
    await scheduleTurboPoll();
  }
});

// Listen for storage changes to detect turbo mode toggle
browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes[CONFIG.STORAGE_KEY_TURBO_END]) {
    console.log("[OTL] Turbo mode state changed, reconfiguring alarms");
    setupAlarm();
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
