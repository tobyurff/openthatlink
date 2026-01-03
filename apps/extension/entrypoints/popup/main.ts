import { CONFIG } from "@/utils/config";
import {
  getOrCreateSecret,
  regenerateSecret,
  getStoredBaseUrl,
  storeBaseUrl,
  resetBaseUrl,
  getTurboEndTime,
  enableTurboMode,
  disableTurboMode,
  getOpenStats,
} from "@/utils/storage";
import { getWebhookUrl } from "@/utils/secret";

// DOM elements
let webhookUrlInput: HTMLInputElement;
let exampleGet: HTMLElement;
let exampleEncoded: HTMLElement;
let exampleCurl: HTMLElement;
let copyBtn: HTMLButtonElement;
let customBadge: HTMLElement;
let baseUrlInput: HTMLInputElement;

// Turbo mode elements
let statusBar: HTMLElement;
let statusText: HTMLElement;
let statusDot: HTMLElement;
let turboSection: HTMLElement;
let turboActiveSection: HTMLElement;
let enableTurboBtn: HTMLButtonElement;
let disableTurboBtn: HTMLButtonElement;
let turboCountdown: HTMLElement;

// Turbo mode countdown timer
let turboCountdownInterval: ReturnType<typeof setInterval> | null = null;

// Stats refresh interval
let statsRefreshInterval: ReturnType<typeof setInterval> | null = null;

// Stats elements
let openCountEl: HTMLElement;
let lastLinkSection: HTMLElement;
let lastLinkEl: HTMLAnchorElement;

// Inline stats elements (below status bar)
let statsInline: HTMLElement;
let statsCountInline: HTMLElement;
let lastLinkSectionInline: HTMLElement;
let lastLinkInline: HTMLAnchorElement;

// Footer elements
let footerLink: HTMLAnchorElement;

/**
 * Update all UI elements with the current webhook URL
 */
function updateWebhookDisplay(secret: string, baseUrl: string) {
  const webhookUrl = getWebhookUrl(secret, baseUrl);

  // Check if using the default server (normalize for comparison)
  const normalizedBaseUrl = baseUrl.toLowerCase().replace(/\/$/, "");
  const isSelfHosted = normalizedBaseUrl !== "https://openthat.link";

  // Show webhook URL with example link
  webhookUrlInput.value = `${webhookUrl}?link=example.com`;

  // Update examples with actual webhook URL
  exampleGet.textContent = `${webhookUrl}
    ?link=yahoo.com,google.com`;

  // URL-encoded example with Google News URLs (English and French)
  const googleNewsEN = encodeURIComponent("https://news.google.com/home?hl=en-US");
  const googleNewsFR = encodeURIComponent("https://news.google.com/home?hl=fr-FR");
  exampleEncoded.textContent = `${webhookUrl}
    ?links[]=${googleNewsEN}
    &links[]=${googleNewsFR}`;

  exampleCurl.textContent = `curl -X POST ${webhookUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"links": ["https://example.com/some-example-page/"]}'`;

  // Show/hide self-hosted badge
  if (isSelfHosted) {
    customBadge.classList.remove("hidden");
  } else {
    customBadge.classList.add("hidden");
  }

  // Update base URL input
  baseUrlInput.value = isSelfHosted ? baseUrl : "";
  baseUrlInput.placeholder = CONFIG.PUBLIC_BASE_URL;
}

/**
 * Show a temporary feedback message on a button
 */
function showButtonFeedback(
  button: HTMLButtonElement,
  text: string,
  duration = 2000
) {
  const originalText = button.textContent;
  button.textContent = text;
  button.classList.add("copied");
  setTimeout(() => {
    button.textContent = originalText;
    button.classList.remove("copied");
  }, duration);
}

/**
 * Format remaining time as M:SS
 */
function formatTimeRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Update the turbo mode UI based on current state
 */
async function updateTurboModeUI(): Promise<void> {
  const turboEndTime = await getTurboEndTime();

  if (turboEndTime) {
    // Turbo mode is active
    turboSection.classList.add("hidden");
    turboActiveSection.classList.remove("hidden");
    statusBar.classList.add("turbo-active");
    statusText.textContent = "Turbo Mode - checking for new links to open every 10 seconds";

    // Start countdown
    startTurboCountdown(turboEndTime);
  } else {
    // Turbo mode is inactive
    turboSection.classList.remove("hidden");
    turboActiveSection.classList.add("hidden");
    statusBar.classList.remove("turbo-active");
    statusText.textContent = "Checking for new links to open every 60 seconds";

    // Stop countdown
    stopTurboCountdown();
  }
}

/**
 * Start the turbo mode countdown timer
 */
function startTurboCountdown(endTime: number): void {
  stopTurboCountdown();

  const updateCountdown = () => {
    const remaining = endTime - Date.now();
    if (remaining <= 0) {
      // Turbo mode expired
      stopTurboCountdown();
      updateTurboModeUI();
      return;
    }
    turboCountdown.textContent = formatTimeRemaining(remaining);
  };

  // Update immediately
  updateCountdown();

  // Update every second
  turboCountdownInterval = setInterval(updateCountdown, 1000);
}

/**
 * Stop the turbo mode countdown timer
 */
function stopTurboCountdown(): void {
  if (turboCountdownInterval) {
    clearInterval(turboCountdownInterval);
    turboCountdownInterval = null;
  }
}

/**
 * Truncate a URL for display
 */
function truncateUrl(url: string, maxLength = 40): string {
  try {
    const parsed = new URL(url);
    const display = parsed.hostname + parsed.pathname;
    if (display.length <= maxLength) return display;
    return display.substring(0, maxLength - 3) + "...";
  } catch {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength - 3) + "...";
  }
}

/**
 * Update the stats display
 */
async function updateStatsDisplay(): Promise<void> {
  const stats = await getOpenStats();

  openCountEl.textContent = stats.count.toString();

  if (stats.lastLink) {
    lastLinkSection.style.display = "block";
    lastLinkEl.href = stats.lastLink;
    lastLinkEl.textContent = truncateUrl(stats.lastLink);
    lastLinkEl.title = stats.lastLink;
  } else {
    lastLinkSection.style.display = "none";
  }

  // When count > 0: show inline stats (below status bar), hide bottom stats section
  // When count = 0: hide inline stats, show bottom stats section
  const statsSection = document.getElementById("statsSection") as HTMLElement;

  if (stats.count > 0) {
    // Update inline stats content
    if (stats.count <= 5) {
      // Congratulatory message for first 5 tabs
      const tabWord = stats.count === 1 ? "tab" : "tabs";
      statsCountInline.innerHTML = `Woohoo! You've opened your first <span>${stats.count}</span> ${tabWord} through a webhook`;
    } else {
      statsCountInline.innerHTML = `<span>${stats.count}</span> links opened`;
    }

    // Update inline last link
    if (stats.lastLink) {
      lastLinkSectionInline.style.display = "block";
      lastLinkInline.href = stats.lastLink;
      lastLinkInline.textContent = truncateUrl(stats.lastLink);
      lastLinkInline.title = stats.lastLink;
    } else {
      lastLinkSectionInline.style.display = "none";
    }

    statsInline.classList.remove("hidden");
    statsSection.classList.add("hidden");
  } else {
    statsInline.classList.add("hidden");
    statsSection.classList.remove("hidden");
  }
}

async function init() {
  // Get DOM elements
  webhookUrlInput = document.getElementById("webhookUrl") as HTMLInputElement;
  exampleGet = document.getElementById("exampleGet") as HTMLElement;
  exampleEncoded = document.getElementById("exampleEncoded") as HTMLElement;
  exampleCurl = document.getElementById("exampleCurl") as HTMLElement;
  copyBtn = document.getElementById("copyBtn") as HTMLButtonElement;
  customBadge = document.getElementById("customBadge") as HTMLElement;
  baseUrlInput = document.getElementById("baseUrlInput") as HTMLInputElement;

  // Get turbo mode DOM elements
  statusBar = document.getElementById("statusBar") as HTMLElement;
  statusText = document.getElementById("statusText") as HTMLElement;
  statusDot = document.getElementById("statusDot") as HTMLElement;
  turboSection = document.getElementById("turboSection") as HTMLElement;
  turboActiveSection = document.getElementById("turboActiveSection") as HTMLElement;
  enableTurboBtn = document.getElementById("enableTurboBtn") as HTMLButtonElement;
  disableTurboBtn = document.getElementById("disableTurboBtn") as HTMLButtonElement;
  turboCountdown = document.getElementById("turboCountdown") as HTMLElement;

  // Get current config
  const secret = await getOrCreateSecret();
  const baseUrl = await getStoredBaseUrl();

  // Initial UI update
  updateWebhookDisplay(secret, baseUrl);

  // Get stats DOM elements
  openCountEl = document.getElementById("openCount") as HTMLElement;
  lastLinkSection = document.getElementById("lastLinkSection") as HTMLElement;
  lastLinkEl = document.getElementById("lastLink") as HTMLAnchorElement;

  // Get inline stats DOM elements
  statsInline = document.getElementById("statsInline") as HTMLElement;
  statsCountInline = document.getElementById("statsCountInline") as HTMLElement;
  lastLinkSectionInline = document.getElementById("lastLinkSectionInline") as HTMLElement;
  lastLinkInline = document.getElementById("lastLinkInline") as HTMLAnchorElement;

  // Get footer elements and set link with secret
  footerLink = document.getElementById("footerLink") as HTMLAnchorElement;
  footerLink.href = `https://openthat.link#${secret}`;

  // Initialize stats display
  await updateStatsDisplay();

  // Refresh stats every 2 seconds while popup is open
  statsRefreshInterval = setInterval(async () => {
    await updateStatsDisplay();
  }, 2000);

  // Auto-enable turbo mode for first-time users (counter is 0)
  const stats = await getOpenStats();
  const turboEndTime = await getTurboEndTime();
  if (stats.count === 0 && !turboEndTime) {
    await enableTurboMode();
  }

  // Initialize turbo mode UI
  await updateTurboModeUI();

  // Copy button functionality
  copyBtn.addEventListener("click", async () => {
    const webhookUrl = webhookUrlInput.value;
    try {
      await navigator.clipboard.writeText(webhookUrl);
      showButtonFeedback(copyBtn, "Copied!");
    } catch (err) {
      console.error("Failed to copy:", err);
      // Fallback: select the input
      webhookUrlInput.select();
      document.execCommand("copy");
    }
  });

  // Example copy buttons
  document.querySelectorAll(".copy-example-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const button = e.target as HTMLButtonElement;
      const exampleId = button.dataset.example;
      const exampleEl = document.getElementById(exampleId!) as HTMLElement;

      if (exampleEl) {
        try {
          await navigator.clipboard.writeText(exampleEl.textContent || "");
          const originalText = button.textContent;
          button.textContent = "Copied!";
          button.classList.add("copied");
          setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove("copied");
          }, 1500);
        } catch (err) {
          console.error("Failed to copy example:", err);
        }
      }
    });
  });

  // Advanced section toggle
  const advancedSection = document.getElementById(
    "advancedSection"
  ) as HTMLElement;
  const advancedToggle = document.getElementById(
    "advancedToggle"
  ) as HTMLElement;

  advancedToggle.addEventListener("click", () => {
    advancedSection.classList.toggle("open");
  });

  // Turbo mode enable button
  enableTurboBtn.addEventListener("click", async () => {
    await enableTurboMode();
    await updateTurboModeUI();
  });

  // Turbo mode disable button
  disableTurboBtn.addEventListener("click", async () => {
    await disableTurboMode();
    await updateTurboModeUI();
  });

  // Save configuration
  const saveConfigBtn = document.getElementById(
    "saveConfigBtn"
  ) as HTMLButtonElement;
  saveConfigBtn.addEventListener("click", async () => {
    const newBaseUrl = baseUrlInput.value.trim().replace(/\/$/, "");

    // If empty or matches default, reset to default
    if (!newBaseUrl || newBaseUrl === CONFIG.PUBLIC_BASE_URL) {
      await resetBaseUrl();
    } else {
      // Validate URL format
      try {
        new URL(newBaseUrl);
      } catch {
        alert("Please enter a valid URL (e.g., https://myserver.com)");
        return;
      }
      await storeBaseUrl(newBaseUrl);
    }

    const updatedBaseUrl = await getStoredBaseUrl();
    updateWebhookDisplay(secret, updatedBaseUrl);
    showButtonFeedback(saveConfigBtn, "Saved!");
  });

  // Reset configuration
  const resetConfigBtn = document.getElementById(
    "resetConfigBtn"
  ) as HTMLButtonElement;
  resetConfigBtn.addEventListener("click", async () => {
    await resetBaseUrl();
    const updatedBaseUrl = await getStoredBaseUrl();
    updateWebhookDisplay(secret, updatedBaseUrl);
    showButtonFeedback(resetConfigBtn, "Reset!");
  });

  // Regenerate secret functionality
  const showRegenerateBtn = document.getElementById(
    "showRegenerateBtn"
  ) as HTMLButtonElement;
  const regenerateConfirm = document.getElementById(
    "regenerateConfirm"
  ) as HTMLElement;
  const confirmRegenerateBtn = document.getElementById(
    "confirmRegenerateBtn"
  ) as HTMLButtonElement;
  const cancelRegenerateBtn = document.getElementById(
    "cancelRegenerateBtn"
  ) as HTMLButtonElement;

  showRegenerateBtn.addEventListener("click", () => {
    showRegenerateBtn.classList.add("hidden");
    regenerateConfirm.classList.remove("hidden");
  });

  cancelRegenerateBtn.addEventListener("click", () => {
    regenerateConfirm.classList.add("hidden");
    showRegenerateBtn.classList.remove("hidden");
  });

  confirmRegenerateBtn.addEventListener("click", async () => {
    const newSecret = await regenerateSecret();
    const currentBaseUrl = await getStoredBaseUrl();

    // Update UI
    updateWebhookDisplay(newSecret, currentBaseUrl);

    // Update footer link with new secret
    footerLink.href = `https://openthat.link#${newSecret}`;

    // Refresh stats (now reset to 0)
    await updateStatsDisplay();

    // Reset UI state
    regenerateConfirm.classList.add("hidden");
    showRegenerateBtn.classList.remove("hidden");

    // Show feedback
    showButtonFeedback(copyBtn, "New URL!");
  });
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", init);
