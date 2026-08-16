import { useState, useEffect } from "react";
import { scanRepo, getRemediation } from "../api";

/**
 * RepoScanner Component
 * Allows users to input a GitHub repo URL and view vulnerability scan results.
 * Includes AI remediation for individual vulnerabilities.
 */
export default function RepoScanner({ onScanned }) {
  const [repoUrl, setRepoUrl] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [remediations, setRemediations] = useState({});
  const [loadingRemediation, setLoadingRemediation] = useState({});

  const handleScan = async () => {
    if (!repoUrl.trim()) return;

    setLoading(true);
    setError(null);
    setScanResult(null);
    setRemediations({});

    try {
      const data = await scanRepo(repoUrl);
      setScanResult(data);
      onScanned?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemediate = async (vuln, index) => {
    setLoadingRemediation((prev) => ({ ...prev, [index]: true }));
    try {
      const data = await getRemediation(
        vuln.package,
        vuln.cve,
        vuln.description
      );
      setRemediations((prev) => ({ ...prev, [index]: data }));
    } catch (err) {
      setRemediations((prev) => ({
        ...prev,
        [index]: { error: err.message },
      }));
    } finally {
      setLoadingRemediation((prev) => ({ ...prev, [index]: false }));
    }
  };

  const severityColors = {
    CRITICAL: "text-red-400 bg-red-500/10 border-red-500/20",
    HIGH: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    MEDIUM: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    LOW: "text-green-400 bg-green-500/10 border-green-500/20",
    UNKNOWN: "text-slate-400 bg-slate-500/10 border-slate-500/20",
  };

  const scoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-4">
      {/* Input Section */}
      <div className="bg-brand-card border border-white/5 rounded-lg p-6">
        <h2 className="text-base font-semibold text-white mb-0.5">
          Repository Vulnerability Scanner
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Enter a GitHub repository URL to scan for dependency vulnerabilities
          using OSV + NVD intelligence.
        </p>

        <div className="flex gap-3">
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/username/repository"
            className="flex-1 bg-brand-dark border border-white/5 rounded-md px-4 py-2.5 text-gray-200 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan/50"
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
          />
          <button
            onClick={handleScan}
            disabled={loading || !repoUrl.trim()}
            className="px-5 py-2.5 bg-brand-orange hover:bg-brand-orange-light text-white text-sm font-medium rounded-md shadow-glow-orange-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Scanning...
              </span>
            ) : (
              "Scan Repository"
            )}
          </button>
        </div>

        {loading && (
          <div className="mt-4 p-3 bg-brand-cyan/8 border border-brand-cyan/15 rounded-md text-brand-cyan text-sm flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Cloning repository, extracting dependencies, and querying CVE databases...
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-500/8 border border-red-500/15 rounded-md text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Results Section */}
      {scanResult && (
        <div className="space-y-4">
          {/* Summary Card */}
          <div className="bg-brand-card border border-white/5 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">
                Scan Results
              </h3>
              <div
                className={`text-2xl font-bold ${scoreColor(
                  scanResult.security_score
                )}`}
              >
                {scanResult.security_score}/100
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <div className="bg-brand-dark border border-white/5 rounded-md p-3 text-center">
                <div className="text-lg font-semibold text-brand-cyan">
                  {scanResult.dependencies_scanned}
                </div>
                <div className="text-[11px] text-gray-500 font-medium">Dependencies</div>
              </div>
              <div className="bg-brand-dark border border-white/5 rounded-md p-3 text-center">
                <div className="text-lg font-semibold text-red-400">
                  {scanResult.critical_count}
                </div>
                <div className="text-[11px] text-gray-500 font-medium">Critical</div>
              </div>
              <div className="bg-brand-dark border border-white/5 rounded-md p-3 text-center">
                <div className="text-lg font-semibold text-orange-400">
                  {scanResult.high_count}
                </div>
                <div className="text-[11px] text-gray-500 font-medium">High</div>
              </div>
              <div className="bg-brand-dark border border-white/5 rounded-md p-3 text-center">
                <div className="text-lg font-semibold text-yellow-400">
                  {scanResult.medium_count}
                </div>
                <div className="text-[11px] text-gray-500 font-medium">Medium</div>
              </div>
              <div className="bg-brand-dark border border-white/5 rounded-md p-3 text-center">
                <div className="text-lg font-semibold text-green-400">
                  {scanResult.low_count}
                </div>
                <div className="text-[11px] text-gray-500 font-medium">Low</div>
              </div>
            </div>
          </div>

          {/* Vulnerability List */}
          {scanResult.vulnerabilities?.length > 0 ? (
            <div className="bg-brand-card border border-white/5 rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-400 mb-4">
                Vulnerabilities ({scanResult.vulnerabilities.length})
              </h3>

              <div className="space-y-2">
                {scanResult.vulnerabilities.map((vuln, idx) => (
                  <div
                    key={idx}
                    className="bg-brand-dark border border-white/5 rounded-md p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-mono text-sm text-white font-medium">
                          {vuln.package}
                        </span>
                        {vuln.version && vuln.version !== "unknown" && (
                          <span className="ml-2 text-xs text-gray-500">
                            v{vuln.version}
                          </span>
                        )}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          severityColors[vuln.severity] ||
                          severityColors.UNKNOWN
                        }`}
                      >
                        {vuln.severity}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                      <span>CVE: {vuln.cve}</span>
                      {vuln.cvss > 0 && <span>CVSS: {vuln.cvss}</span>}
                      {vuln.attack_vector && (
                        <span className="text-brand-cyan">
                          Vector: {vuln.attack_vector}
                        </span>
                      )}
                      {vuln.attack_complexity && (
                        <span className="text-brand-orange">
                          Complexity: {vuln.attack_complexity}
                        </span>
                      )}
                    </div>

                    {vuln.owasp_category && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border bg-purple-500/10 border-purple-500/25 text-purple-400">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751A11.959 11.959 0 0 0 12 3.714Z" />
                          </svg>
                          OWASP {vuln.owasp_id}
                        </span>
                        <span className="text-[10px] text-gray-500">{vuln.owasp_category}</span>
                      </div>
                    )}

                    {vuln.nvd_description ? (
                      <p className="text-xs text-gray-400 line-clamp-3 mb-2">
                        {vuln.nvd_description}
                      </p>
                    ) : vuln.description ? (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                        {vuln.description}
                      </p>
                    ) : null}

                    {vuln.references?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {vuln.references.slice(0, 3).map((ref, ri) => (
                          <a
                            key={ri}
                            href={ref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-brand-cyan/70 hover:text-brand-cyan underline underline-offset-2 truncate max-w-[200px]"
                          >
                            {new URL(ref).hostname}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Remediation */}
                    {!remediations[idx] ? (
                      <button
                        onClick={() => handleRemediate(vuln, idx)}
                        disabled={loadingRemediation[idx]}
                        className="text-xs px-3 py-1.5 bg-brand-cyan/8 border border-brand-cyan/20 rounded-md text-brand-cyan hover:bg-brand-cyan/15 transition disabled:opacity-50 font-medium"
                      >
                        {loadingRemediation[idx]
                          ? "Getting AI fix..."
                          : "Get AI Remediation"}
                      </button>
                    ) : remediations[idx].error ? (
                      <div className="text-xs text-red-400 p-2 bg-red-500/8 rounded-md">
                        Failed to get remediation: {remediations[idx].error}
                      </div>
                    ) : (
                      <div className="mt-2 p-3 bg-brand-cyan/5 border border-brand-cyan/10 rounded-md space-y-2">
                        <div className="text-xs">
                          <span className="text-brand-cyan font-semibold">
                            Explanation:{" "}
                          </span>
                          <span className="text-gray-300">
                            {remediations[idx].explanation}
                          </span>
                        </div>
                        <div className="text-xs">
                          <span className="text-brand-cyan font-semibold">
                            Fix:{" "}
                          </span>
                          <span className="text-gray-300">
                            {remediations[idx].suggested_fix}
                          </span>
                        </div>
                        {remediations[idx].recommended_version && (
                          <div className="text-xs">
                            <span className="text-brand-cyan font-semibold">
                              Upgrade to:{" "}
                            </span>
                            <span className="text-emerald-300 font-mono">
                              {remediations[idx].recommended_version}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-lg p-6 text-center">
              <svg className="w-10 h-10 text-emerald-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
              </svg>
              <h3 className="text-base font-semibold text-emerald-400">
                No Vulnerabilities Found
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                All {scanResult.dependencies_scanned} dependencies passed the
                security check.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
