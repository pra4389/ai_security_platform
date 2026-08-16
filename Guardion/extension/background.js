/**
 * Guardion — Background Service Worker (Manifest V3)
 * Handles communication between content script and the Guardion backend API.
 * Includes JWT auth header forwarding and threat category tracking.
 */

const API_BASE = "http://localhost:8000/api";

/**
 * Listen for messages from the content script.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "analyzePrompt") {
    analyzePrompt(message.prompt, message.source)
      .then((result) => sendResponse(result))
      .catch((err) =>
        sendResponse({
          error: true,
          risk_score: 0,
          decision: "allow",
          detected_categories: [],
          message: err.message,
        })
      );
    return true;
  }

  if (message.action === "getStats") {
    getStats()
      .then((result) => sendResponse(result))
      .catch((err) => sendResponse({ error: true, message: err.message }));
    return true;
  }
});

/**
 * Get auth headers if user is logged in.
 */
async function getAuthHeaders() {
  const data = await chrome.storage.local.get("guardion_token");
  const headers = { "Content-Type": "application/json" };
  if (data.guardion_token) {
    headers["Authorization"] = `Bearer ${data.guardion_token}`;
  }
  return headers;
}

/**
 * Send prompt to Guardion backend for analysis.
 */
async function analyzePrompt(prompt, source) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/analyze_prompt`, {
      method: "POST",
      headers,
      body: JSON.stringify({ prompt, source }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    await updateLocalStats(data.decision, data.detected_categories || []);
    return data;
  } catch (error) {
    console.error("[Guardion] API call failed:", error);
    return {
      risk_score: 0,
      decision: "allow",
      detected_categories: [],
      error: true,
      message: "Backend unreachable — prompt allowed by default",
    };
  }
}

/**
 * Update local extension stats with category tracking.
 */
async function updateLocalStats(decision, categories) {
  const data = await chrome.storage.local.get("guardion_stats");
  const stats = data.guardion_stats || {
    total: 0,
    allowed: 0,
    warned: 0,
    blocked: 0,
    recentCategories: [],
  };

  stats.total++;
  if (decision === "allow") stats.allowed++;
  else if (decision === "warn") stats.warned++;
  else if (decision === "block") stats.blocked++;

  // Track recent threat categories (keep last 20 unique)
  if (categories && categories.length > 0) {
    const existing = new Set(stats.recentCategories || []);
    categories.forEach((c) => existing.add(c));
    stats.recentCategories = Array.from(existing).slice(-20);
  }

  await chrome.storage.local.set({ guardion_stats: stats });
}

/**
 * Get local stats for the popup.
 */
async function getStats() {
  const data = await chrome.storage.local.get("guardion_stats");
  return data.guardion_stats || {
    total: 0,
    allowed: 0,
    warned: 0,
    blocked: 0,
    recentCategories: [],
  };
}
async function getStats() {
  const data = await chrome.storage.local.get("guardion_stats");
  return data.guardion_stats || { total: 0, allowed: 0, warned: 0, blocked: 0 };
}
