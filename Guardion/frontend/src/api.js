/**
 * Guardion API Service
 * Centralizes all backend API calls for the dashboard.
 * Includes JWT auth headers when token is available.
 */

const API_ROOT = import.meta.env.VITE_API_URL || "";

const API_BASE = `${API_ROOT}/api`;
const AUTH_BASE = `${API_ROOT}/auth`;
const ADMIN_BASE = `${API_ROOT}/admin`;

function parseApiError(payload, fallback) {
  if (!payload?.detail) return fallback;
  if (typeof payload.detail === "string") return payload.detail;
  if (Array.isArray(payload.detail)) {
    return payload.detail.map((item) => item.msg || String(item)).join(". ");
  }
  return fallback;
}

async function apiFetch(url, options = {}) {
  try {
    return await fetch(url, options);
  } catch {
    throw new Error(
      "Cannot reach the Guardion backend. Start it with: cd backend && python -m uvicorn app.main:app --reload --port 8000"
    );
  }
}

/**
 * Get auth headers from localStorage token.
 */
function authHeaders() {
  const token = localStorage.getItem("guardion_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Fetch dashboard metrics and recent activity.
 */
export async function fetchDashboard() {
  const res = await apiFetch(`${API_BASE}/dashboard`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(`Dashboard API error: ${res.status}`);
  return res.json();
}

/**
 * Analyze a prompt for sensitive data (for testing from dashboard).
 * @param {string} prompt - The prompt text to analyze.
 * @param {string} source - Origin identifier.
 * @param {boolean} useGemini - Whether to also call Gemini (costs API quota).
 */
export async function analyzePrompt(prompt, source = "dashboard", useGemini = false) {
  const res = await apiFetch(`${API_BASE}/analyze_prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ prompt, source, use_gemini: useGemini }),
  });
  if (!res.ok) throw new Error(`Analyze API error: ${res.status}`);
  return res.json();
}

/**
 * Get Gemini API quota and cache status.
 */
export async function getQuotaStatus() {
  const res = await apiFetch(`${API_BASE}/quota_status`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(`Quota status API error: ${res.status}`);
  return res.json();
}

/**
 * Scan a GitHub repository for vulnerabilities.
 */
export async function scanRepo(repoUrl) {
  const res = await apiFetch(`${API_BASE}/scan_repo`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ repo_url: repoUrl }),
  });
  if (!res.ok) throw new Error(`Scan API error: ${res.status}`);
  return res.json();
}

/**
 * Get trending OWASP Top 10 vulnerability categories from scan history.
 */
export async function getOwaspTrending() {
  const res = await apiFetch(`${API_BASE}/owasp_trending`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(`OWASP trending API error: ${res.status}`);
  return res.json();
}

/**
 * Get AI remediation for a vulnerability.
 */
export async function getRemediation(packageName, cveId, description = "") {
  const res = await apiFetch(`${API_BASE}/remediate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({
      package_name: packageName,
      cve_id: cveId,
      description,
    }),
  });
  if (!res.ok) throw new Error(`Remediation API error: ${res.status}`);
  return res.json();
}

/**
 * Compare prompt classification: Local ML Model vs Gemini API.
 * Returns side-by-side predictions, confidence scores, and a combined decision.
 */
export async function mlCompare(prompt, useGemini = true) {
  const res = await apiFetch(`${API_BASE}/ml_compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ prompt, use_gemini: useGemini }),
  });
  if (!res.ok) throw new Error(`ML Compare API error: ${res.status}`);
  return res.json();
}

/**
 * Scan pasted source code for security vulnerabilities (pre-push checker).
 * @param {string} code - Raw source code text.
 * @param {string} filename - Optional filename for language detection.
 */
export async function scanCode(code, filename = "") {
  const res = await apiFetch(`${API_BASE}/scan_code`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ code, filename }),
  });
  if (!res.ok) throw new Error(`Code scan API error: ${res.status}`);
  return res.json();
}

/**
 * Scan an uploaded source code file for security vulnerabilities.
 * @param {File} file - File object from an <input type="file">.
 */
export async function scanCodeFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiFetch(`${API_BASE}/scan_code_file`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: formData,
  });
  if (!res.ok) throw new Error(`Code file scan API error: ${res.status}`);
  return res.json();
}

/**
 * Fix code vulnerabilities using Gemini AI.
 * @param {string} code - The original source code.
 * @param {Array} vulnerabilities - List of detected vulnerabilities.
 * @param {string} filename - Optional filename.
 */
export async function fixCode(code, vulnerabilities = [], filename = "") {
  const res = await apiFetch(`${API_BASE}/fix_code`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ code, vulnerabilities, filename }),
  });
  if (!res.ok) throw new Error(`Fix code API error: ${res.status}`);
  return res.json();
}

// ──────────────────── Auth API ────────────────────

export async function apiSignup(name, email, password) {
  const res = await apiFetch(`${AUTH_BASE}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(parseApiError(err, `Signup failed (${res.status}). Is the backend running on port 8000?`));
  }
  return res.json();
}

export async function apiLogin(email, password) {
  const res = await apiFetch(`${AUTH_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(parseApiError(err, `Login failed (${res.status}). Is the backend running on port 8000?`));
  }
  return res.json();
}

export async function apiGetMe() {
  const res = await apiFetch(`${AUTH_BASE}/me`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(`Auth error: ${res.status}`);
  return res.json();
}

// ──────────────────── Admin API ────────────────────

export async function adminGetUsers() {
  const res = await apiFetch(`${ADMIN_BASE}/users`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(`Admin API error: ${res.status}`);
  return res.json();
}

export async function adminGetStats() {
  const res = await apiFetch(`${ADMIN_BASE}/stats`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(`Admin API error: ${res.status}`);
  return res.json();
}

export async function adminGetPromptLogs(page = 1, perPage = 20) {
  const res = await apiFetch(`${ADMIN_BASE}/prompt_logs?page=${page}&per_page=${perPage}`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(`Admin API error: ${res.status}`);
  return res.json();
}

export async function adminGetRepoScans(page = 1, perPage = 20) {
  const res = await apiFetch(`${ADMIN_BASE}/repo_scans?page=${page}&per_page=${perPage}`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(`Admin API error: ${res.status}`);
  return res.json();
}

export async function adminGetCodeScans(page = 1, perPage = 20) {
  const res = await apiFetch(`${ADMIN_BASE}/code_scans?page=${page}&per_page=${perPage}`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(`Admin API error: ${res.status}`);
  return res.json();
}
