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
let exampleCurl: HTMLElement;
let exampleMultiple: HTMLElement;
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

// Stats elements
let openCountEl: HTMLElement;
let lastLinkSection: HTMLElement;
let lastLinkEl: HTMLAnchorElement;

/**
 * Update all UI elements with the current webhook URL
 */
function updateWebhookDisplay(secret: string, baseUrl: string) {
  const webhookUrl = getWebhookUrl(secret, baseUrl);
  const isCustom = baseUrl !== CONFIG.PUBLIC_BASE_URL;

  webhookUrlInput.value = webhookUrl;

  // Update examples with actual webhook URL
  exampleGet.textContent = `${webhookUrl}?link=example.com`;

  exampleCurl.textContent = `curl -X POST ${webhookUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"links": ["https://example.com"]}'`;

  exampleMultiple.textContent = `${webhookUrl}?link=a.com,b.com,c.com`;

  // Show/hide custom badge
  if (isCustom) {
    customBadge.classList.remove("hidden");
  } else {
    customBadge.classList.add("hidden");
  }

  // Update base URL input
  baseUrlInput.value = isCustom ? baseUrl : "";
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
    statusText.textContent = "Turbo mode - polling every 10 seconds";

    // Start countdown
    startTurboCountdown(turboEndTime);
  } else {
    // Turbo mode is inactive
    turboSection.classList.remove("hidden");
    turboActiveSection.classList.add("hidden");
    statusBar.classList.remove("turbo-active");
    statusText.textContent = "Polling every 60 seconds";

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
}

async function init() {
  // Get DOM elements
  webhookUrlInput = document.getElementById("webhookUrl") as HTMLInputElement;
  exampleGet = document.getElementById("exampleGet") as HTMLElement;
  exampleCurl = document.getElementById("exampleCurl") as HTMLElement;
  exampleMultiple = document.getElementById("exampleMultiple") as HTMLElement;
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

  // Initialize turbo mode UI
  await updateTurboModeUI();

  // Initialize stats display
  await updateStatsDisplay();

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
    const newBaseUrl = baseUrlInput.value.trim();

    if (newBaseUrl) {
      // Validate URL format
      try {
        new URL(newBaseUrl);
      } catch {
        alert("Please enter a valid URL (e.g., https://myserver.com)");
        return;
      }
      await storeBaseUrl(newBaseUrl);
    } else {
      // Empty means use default
      await resetBaseUrl();
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

    // Reset UI state
    regenerateConfirm.classList.add("hidden");
    showRegenerateBtn.classList.remove("hidden");

    // Show feedback
    showButtonFeedback(copyBtn, "New URL!");
  });
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", init);
