/**
 * Guardion — Popup Script
 * Loads stats, displays threat meter, handles toggle settings.
 */

document.addEventListener("DOMContentLoaded", async () => {
  // ── Load Stats ──
  try {
    const response = await chrome.runtime.sendMessage({ action: "getStats" });
    if (response) {
      document.getElementById("totalCount").textContent = response.total || 0;
      document.getElementById("allowedCount").textContent = response.allowed || 0;
      document.getElementById("warnedCount").textContent = response.warned || 0;
      document.getElementById("blockedCount").textContent = response.blocked || 0;

      // Update threat meter
      updateThreatMeter(response);
    }
  } catch (err) {
    console.error("[Guardion] Failed to load stats:", err);
  }

  // ── Load Settings ──
  const settings = await chrome.storage.local.get("guardion_settings");
  const config = settings.guardion_settings || {
    protection: true,
    sanitize: false,
    aiFix: true,
  };

  const toggleProtection = document.getElementById("toggleProtection");
  const toggleSanitize = document.getElementById("toggleSanitize");
  const toggleAiFix = document.getElementById("toggleAiFix");
  const statusBadge = document.getElementById("statusBadge");

  toggleProtection.checked = config.protection;
  toggleSanitize.checked = config.sanitize;
  toggleAiFix.checked = config.aiFix !== false;

  updateStatusBadge(config.protection);

  // ── Settings Change Handlers ──
  toggleProtection.addEventListener("change", async () => {
    config.protection = toggleProtection.checked;
    await chrome.storage.local.set({ guardion_settings: config });
    updateStatusBadge(config.protection);
  });

  toggleSanitize.addEventListener("change", async () => {
    config.sanitize = toggleSanitize.checked;
    await chrome.storage.local.set({ guardion_settings: config });
  });

  toggleAiFix.addEventListener("change", async () => {
    config.aiFix = toggleAiFix.checked;
    await chrome.storage.local.set({ guardion_settings: config });
  });

  function updateStatusBadge(isActive) {
    const dot = statusBadge.querySelector(".status-dot");
    if (isActive) {
      statusBadge.innerHTML = '<span class="status-dot"></span> Protected';
      statusBadge.className = "status-badge status-active";
    } else {
      statusBadge.innerHTML = '<span class="status-dot"></span> Disabled';
      statusBadge.className = "status-badge status-inactive";
    }
  }

  function updateThreatMeter(stats) {
    const total = stats.total || 0;
    const blocked = stats.blocked || 0;
    const warned = stats.warned || 0;
    const threats = blocked + warned;

    const threatLevel = document.getElementById("threatLevel");
    const threatBar = document.getElementById("threatBar");
    const threatCategories = document.getElementById("threatCategories");

    if (total === 0) {
      threatLevel.textContent = "No Data";
      threatLevel.style.color = "#71717a";
      threatBar.style.width = "0%";
      threatBar.style.background = "#71717a";
      return;
    }

    const ratio = threats / total;
    let level, color;

    if (ratio >= 0.5) {
      level = "Critical";
      color = "#ef4444";
    } else if (ratio >= 0.3) {
      level = "High";
      color = "#f97316";
    } else if (ratio >= 0.1) {
      level = "Medium";
      color = "#eab308";
    } else {
      level = "Low";
      color = "#22c55e";
    }

    threatLevel.textContent = level;
    threatLevel.style.color = color;
    threatBar.style.width = `${Math.max(5, ratio * 100)}%`;
    threatBar.style.background = color;

    // Show recent categories if available
    if (stats.recentCategories && stats.recentCategories.length > 0) {
      threatCategories.innerHTML = stats.recentCategories
        .slice(0, 5)
        .map(c => `<span class="threat-tag">${c}</span>`)
        .join("");
    }
  }
});
