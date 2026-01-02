import { CONFIG } from "@/utils/config";
import {
  getOrCreateSecret,
  regenerateSecret,
  getStoredBaseUrl,
  storeBaseUrl,
  resetBaseUrl,
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

async function init() {
  // Get DOM elements
  webhookUrlInput = document.getElementById("webhookUrl") as HTMLInputElement;
  exampleGet = document.getElementById("exampleGet") as HTMLElement;
  exampleCurl = document.getElementById("exampleCurl") as HTMLElement;
  exampleMultiple = document.getElementById("exampleMultiple") as HTMLElement;
  copyBtn = document.getElementById("copyBtn") as HTMLButtonElement;
  customBadge = document.getElementById("customBadge") as HTMLElement;
  baseUrlInput = document.getElementById("baseUrlInput") as HTMLInputElement;

  // Get current config
  const secret = await getOrCreateSecret();
  const baseUrl = await getStoredBaseUrl();

  // Initial UI update
  updateWebhookDisplay(secret, baseUrl);

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
