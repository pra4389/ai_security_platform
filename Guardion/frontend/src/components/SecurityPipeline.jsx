import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  scanRepo,
  getRemediation,
  scanCode,
  scanCodeFile,
  fixCode,
} from "../api";

// ── Pipeline stage definitions ──
const STAGES = [
  {
    id: 1,
    label: "Repo Scanner",
    desc: "Scan dependencies for CVEs",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    ),
  },
  {
    id: 2,
    label: "Static Analyzer",
    desc: "Analyze source code patterns",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
      />
    ),
  },
  {
    id: 3,
    label: "Fix Suggestion",
    desc: "AI-powered code fixes",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z"
      />
    ),
  },
];

// ── Shared severity styles ──
const sevColors = {
  CRITICAL: "text-red-400 bg-red-500/10 border-red-500/20",
  HIGH: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  MEDIUM: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  LOW: "text-green-400 bg-green-500/10 border-green-500/20",
  UNKNOWN: "text-slate-400 bg-slate-500/10 border-slate-500/20",
};
const sevDots = {
  CRITICAL: "bg-red-400",
  HIGH: "bg-amber-400",
  MEDIUM: "bg-yellow-400",
};
const vulnLabels = {
  hardcoded_secret: "Hardcoded Secret",
  private_key: "Private Key Detected",
  command_injection: "Command Injection",
  unsafe_eval: "Unsafe eval() Usage",
  sql_injection: "SQL Injection Risk",
  insecure_deserialization: "Insecure Deserialization",
  path_traversal: "Path Traversal",
  weak_crypto: "Weak Cryptography",
  hardcoded_config: "Hardcoded Config",
  cloud_key_leak: "Cloud Key Leak",
};
const scoreColor = (s) =>
  s >= 80 ? "text-emerald-400" : s >= 50 ? "text-amber-400" : "text-red-400";
const scoreRing = (s) =>
  s >= 80
    ? "stroke-emerald-400"
    : s >= 50
    ? "stroke-amber-400"
    : "stroke-red-400";

// Small spinner
const Spinner = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export default function SecurityPipeline({ onScanned }) {
  const [activeStage, setActiveStage] = useState(1);

  /* ── Stage 1 (Repo Scanner) ── */
  const [repoUrl, setRepoUrl] = useState("");
  const [repoResult, setRepoResult] = useState(null);
  const [repoLoading, setRepoLoading] = useState(false);
  const [repoError, setRepoError] = useState(null);
  const [remediations, setRemediations] = useState({});
  const [loadingRem, setLoadingRem] = useState({});

  /* ── Stage 2 (Static Analyzer) ── */
  const [code, setCode] = useState("");
  const [filename, setFilename] = useState("");
  const [codeResult, setCodeResult] = useState(null);
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState(null);
  const [inputMode, setInputMode] = useState("paste");
  const fileRef = useRef(null);

  /* ── Stage 3 (Fix Suggestion) ── */
  const [fixedCode, setFixedCode] = useState(null);
  const [fixLoading, setFixLoading] = useState(false);
  const [fixError, setFixError] = useState(null);
  const [copied, setCopied] = useState(false);

  // ─── Handlers ────────────────────────────────
  const handleRepoScan = async () => {
    if (!repoUrl.trim()) return;
    setRepoLoading(true);
    setRepoError(null);
    setRepoResult(null);
    setRemediations({});
    try {
      const data = await scanRepo(repoUrl);
      setRepoResult(data);
      onScanned?.();
    } catch (err) {
      setRepoError(err.message);
    } finally {
      setRepoLoading(false);
    }
  };

  const handleRemediate = async (vuln, idx) => {
    setLoadingRem((p) => ({ ...p, [idx]: true }));
    try {
      const data = await getRemediation(vuln.package, vuln.cve, vuln.description);
      setRemediations((p) => ({ ...p, [idx]: data }));
    } catch (err) {
      setRemediations((p) => ({ ...p, [idx]: { error: err.message } }));
    } finally {
      setLoadingRem((p) => ({ ...p, [idx]: false }));
    }
  };

  const handleCodeScan = async () => {
    if (!code.trim()) return;
    setCodeLoading(true);
    setCodeError(null);
    setCodeResult(null);
    setFixedCode(null);
    setFixError(null);
    try {
      const res = await scanCode(code, filename);
      setCodeResult(res);
    } catch (err) {
      setCodeError(err.message);
    } finally {
      setCodeLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFilename(file.name);
    setCodeLoading(true);
    setCodeError(null);
    setCodeResult(null);
    setFixedCode(null);
    setFixError(null);
    try {
      const res = await scanCodeFile(file);
      setCodeResult(res);
      const text = await file.text();
      setCode(text);
    } catch (err) {
      setCodeError(err.message);
    } finally {
      setCodeLoading(false);
    }
  };

  const handleFix = async () => {
    if (!code.trim() || !codeResult?.vulnerabilities?.length) return;
    setFixLoading(true);
    setFixError(null);
    setFixedCode(null);
    setCopied(false);
    try {
      const res = await fixCode(code, codeResult.vulnerabilities, filename);
      setFixedCode(res.fixed_code);
    } catch (err) {
      setFixError(err.message);
    } finally {
      setFixLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!fixedCode) return;
    await navigator.clipboard.writeText(fixedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!fixedCode) return;
    const ext = filename || "fixed_code.txt";
    const prefix =
      ext.lastIndexOf(".") !== -1 ? ext.slice(0, ext.lastIndexOf(".")) : ext;
    const suffix =
      ext.lastIndexOf(".") !== -1 ? ext.slice(ext.lastIndexOf(".")) : ".txt";
    const blob = new Blob([fixedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${prefix}_fixed${suffix}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Demo code
  const loadExample = () => {
    setCode(`import os, subprocess, hashlib

password = "admin123"
API_KEY = "sk-1234567890abcdefghijklmnop"

user_input = input("Enter command: ")
os.system(user_input)
subprocess.call(user_input, shell=True)

data = input("Enter expression: ")
result = eval(data)

user_id = input("Enter user ID: ")
query = "SELECT * FROM users WHERE id=" + user_id

hash_val = hashlib.md5(password.encode())
`);
    setFilename("example.py");
    setCodeResult(null);
    setFixedCode(null);
  };

  // Stage completion flags
  const s1Done = !!repoResult;
  const s2Done = !!codeResult;
  const s3Done = !!fixedCode;

  const canGoTo = (id) => {
    if (id === 1) return true;
    if (id === 2) return true; // always accessible
    if (id === 3) return s2Done && codeResult?.vulnerabilities?.length > 0;
    return false;
  };

  // ─── Render ─────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Pipeline Stepper ── */}
      <div className="bg-brand-card border border-white/5 rounded-xl p-6">
        <div className="flex items-center justify-between relative">
          {STAGES.map((stage, i) => {
            const done =
              stage.id === 1 ? s1Done : stage.id === 2 ? s2Done : s3Done;
            const active = activeStage === stage.id;
            const reachable = canGoTo(stage.id);

            return (
              <div key={stage.id} className="flex items-center flex-1 last:flex-none">
                {/* Step circle + label */}
                <button
                  onClick={() => reachable && setActiveStage(stage.id)}
                  className={`flex flex-col items-center gap-1.5 group relative z-10 ${
                    reachable ? "cursor-pointer" : "cursor-not-allowed opacity-40"
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      done
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                        : active
                        ? "bg-brand-orange/15 border-brand-orange/40 text-brand-orange shadow-lg shadow-brand-orange/20"
                        : "bg-white/5 border-white/10 text-gray-500 group-hover:border-white/20"
                    }`}
                  >
                    {done ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    ) : (
                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                        {stage.icon}
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold whitespace-nowrap ${
                      active ? "text-brand-orange" : done ? "text-emerald-400" : "text-gray-500"
                    }`}
                  >
                    {stage.label}
                  </span>
                  <span className="text-[10px] text-gray-600 whitespace-nowrap hidden sm:block">
                    {stage.desc}
                  </span>
                </button>

                {/* Connecting line */}
                {i < STAGES.length - 1 && (
                  <div className="flex-1 mx-3 h-0.5 rounded-full relative -mt-6 sm:-mt-8">
                    <div className="absolute inset-0 bg-white/5 rounded-full" />
                    <motion.div
                      className={`absolute inset-y-0 left-0 rounded-full ${
                        done ? "bg-emerald-500/50" : "bg-white/10"
                      }`}
                      initial={{ width: "0%" }}
                      animate={{ width: done ? "100%" : "0%" }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Stage Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStage}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          {/* ═══════════════════ STAGE 1: Repo Scanner ═══════════════════ */}
          {activeStage === 1 && (
            <div className="space-y-4">
              <div className="bg-brand-card border border-white/5 rounded-lg p-6">
                <h2 className="text-base font-semibold text-white mb-0.5">
                  Repository Vulnerability Scanner
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Enter a GitHub repository URL to scan dependencies for known CVEs via OSV + NVD.
                </p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/repository"
                    className="flex-1 bg-brand-dark border border-white/5 rounded-md px-4 py-2.5 text-gray-200 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan/50"
                    onKeyDown={(e) => e.key === "Enter" && handleRepoScan()}
                  />
                  <button
                    onClick={handleRepoScan}
                    disabled={repoLoading || !repoUrl.trim()}
                    className="px-5 py-2.5 bg-brand-orange hover:bg-brand-orange-light text-white text-sm font-medium rounded-md shadow-glow-orange-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                  >
                    {repoLoading ? (
                      <span className="flex items-center gap-2">
                        <Spinner /> Scanning...
                      </span>
                    ) : (
                      "Scan Repository"
                    )}
                  </button>
                </div>

                {repoLoading && (
                  <div className="mt-4 p-3 bg-brand-cyan/8 border border-brand-cyan/15 rounded-md text-brand-cyan text-sm flex items-center gap-2">
                    <Spinner />
                    Cloning repository, extracting dependencies, and querying CVE databases...
                  </div>
                )}
                {repoError && (
                  <div className="mt-4 p-3 bg-red-500/8 border border-red-500/15 rounded-md text-red-400 text-sm">
                    {repoError}
                  </div>
                )}
              </div>

              {/* Repo Results */}
              {repoResult && (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="bg-brand-card border border-white/5 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-semibold text-white">Scan Results</h3>
                      <div className={`text-2xl font-bold ${scoreColor(repoResult.security_score)}`}>
                        {repoResult.security_score}/100
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {[
                        { label: "Dependencies", val: repoResult.dependencies_scanned, color: "text-brand-cyan" },
                        { label: "Critical", val: repoResult.critical_count, color: "text-red-400" },
                        { label: "High", val: repoResult.high_count, color: "text-orange-400" },
                        { label: "Medium", val: repoResult.medium_count, color: "text-yellow-400" },
                        { label: "Low", val: repoResult.low_count, color: "text-green-400" },
                      ].map((m) => (
                        <div key={m.label} className="bg-brand-dark border border-white/5 rounded-md p-3 text-center">
                          <div className={`text-lg font-semibold ${m.color}`}>{m.val}</div>
                          <div className="text-[11px] text-gray-500 font-medium">{m.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vulnerability list */}
                  {repoResult.vulnerabilities?.length > 0 && (
                    <div className="bg-brand-card border border-white/5 rounded-lg p-6">
                      <h3 className="text-sm font-medium text-gray-400 mb-4">
                        Vulnerabilities ({repoResult.vulnerabilities.length})
                      </h3>
                      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                        {repoResult.vulnerabilities.map((vuln, idx) => (
                          <div key={idx} className="bg-brand-dark border border-white/5 rounded-md p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <span className="font-mono text-sm text-white font-medium">{vuln.package}</span>
                                {vuln.version && vuln.version !== "unknown" && (
                                  <span className="ml-2 text-xs text-gray-500">v{vuln.version}</span>
                                )}
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${sevColors[vuln.severity] || sevColors.UNKNOWN}`}>
                                {vuln.severity}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                              <span>CVE: {vuln.cve}</span>
                              {vuln.cvss > 0 && <span>CVSS: {vuln.cvss}</span>}
                            </div>
                            {vuln.owasp_category && (
                              <div className="flex items-center gap-2 mb-2">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border bg-purple-500/10 border-purple-500/25 text-purple-400">
                                  OWASP {vuln.owasp_id}
                                </span>
                                <span className="text-[10px] text-gray-500">{vuln.owasp_category}</span>
                              </div>
                            )}
                            {(vuln.nvd_description || vuln.description) && (
                              <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                                {vuln.nvd_description || vuln.description}
                              </p>
                            )}

                            {/* Inline Remediation */}
                            {!remediations[idx] ? (
                              <button
                                onClick={() => handleRemediate(vuln, idx)}
                                disabled={loadingRem[idx]}
                                className="text-xs px-3 py-1.5 bg-brand-cyan/8 border border-brand-cyan/20 rounded-md text-brand-cyan hover:bg-brand-cyan/15 transition disabled:opacity-50 font-medium"
                              >
                                {loadingRem[idx] ? "Getting AI fix..." : "Get AI Remediation"}
                              </button>
                            ) : remediations[idx].error ? (
                              <div className="text-xs text-red-400 p-2 bg-red-500/8 rounded-md">
                                Failed: {remediations[idx].error}
                              </div>
                            ) : (
                              <div className="mt-2 p-3 bg-brand-cyan/5 border border-brand-cyan/10 rounded-md space-y-1.5 text-xs">
                                <div>
                                  <span className="text-brand-cyan font-semibold">Explanation: </span>
                                  <span className="text-gray-300">{remediations[idx].explanation}</span>
                                </div>
                                <div>
                                  <span className="text-brand-cyan font-semibold">Fix: </span>
                                  <span className="text-gray-300">{remediations[idx].suggested_fix}</span>
                                </div>
                                {remediations[idx].recommended_version && (
                                  <div>
                                    <span className="text-brand-cyan font-semibold">Upgrade to: </span>
                                    <span className="text-emerald-400 font-mono">{remediations[idx].recommended_version}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Next stage button */}
                  <button
                    onClick={() => setActiveStage(2)}
                    className="w-full py-3 rounded-lg text-sm font-semibold bg-gradient-to-r from-brand-orange to-orange-600 hover:from-orange-500 hover:to-orange-500 text-white flex items-center justify-center gap-2 transition-all"
                  >
                    Next: Analyze Code
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════ STAGE 2: Static Analyzer ═══════════════════ */}
          {activeStage === 2 && (
            <div className="space-y-4">
              <div className="bg-brand-card border border-white/5 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-white">Static Code Analyzer</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Paste or upload source code to detect hardcoded secrets, injections, and weak crypto.
                    </p>
                  </div>
                  <button
                    onClick={loadExample}
                    className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-md transition-all"
                  >
                    Load Example
                  </button>
                </div>

                {/* Mode toggle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setInputMode("paste")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      inputMode === "paste"
                        ? "bg-brand-orange/15 text-brand-orange border border-brand-orange/20"
                        : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                    </svg>
                    Paste Code
                  </button>
                  <button
                    onClick={() => setInputMode("upload")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      inputMode === "upload"
                        ? "bg-brand-orange/15 text-brand-orange border border-brand-orange/20"
                        : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                    Upload File
                  </button>
                </div>

                {inputMode === "paste" && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="filename.py (optional)"
                      value={filename}
                      onChange={(e) => setFilename(e.target.value)}
                      className="w-full bg-brand-dark border border-white/10 rounded-md px-3 py-1.5 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-brand-cyan/50"
                    />
                    <textarea
                      rows={12}
                      placeholder="Paste your source code here..."
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full bg-brand-dark border border-white/10 rounded-md p-4 text-sm text-gray-200 placeholder-gray-600 font-mono focus:outline-none focus:border-brand-cyan/50 resize-y"
                      spellCheck={false}
                    />
                    <button
                      onClick={handleCodeScan}
                      disabled={codeLoading || !code.trim()}
                      className="w-full py-2.5 rounded-md text-sm font-semibold transition-all bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {codeLoading ? (
                        <span className="flex items-center justify-center gap-2"><Spinner /> Analyzing...</span>
                      ) : (
                        "Analyze Code"
                      )}
                    </button>
                  </div>
                )}

                {inputMode === "upload" && (
                  <div className="space-y-3">
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-3 py-10 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:border-brand-orange/40 hover:bg-white/5 transition-all"
                    >
                      <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                      </svg>
                      <div className="text-center">
                        <span className="text-sm text-gray-400">Click to upload a source code file</span>
                        <p className="text-[11px] text-gray-600 mt-1">.py, .js, .ts, .java, .jsx, .tsx — max 1 MB</p>
                      </div>
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".py,.js,.ts,.jsx,.tsx,.java,.mjs,.cjs"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    {filename && (
                      <p className="text-xs text-gray-500">
                        Selected: <span className="text-gray-300 font-medium">{filename}</span>
                      </p>
                    )}
                  </div>
                )}

                {codeError && (
                  <div className="p-3 bg-red-500/8 border border-red-500/15 rounded-md text-red-400 text-sm">
                    {codeError}
                  </div>
                )}
              </div>

              {/* Code scan results */}
              {codeResult && (
                <div className="space-y-4">
                  {/* Score card */}
                  <div className="bg-brand-card border border-white/5 rounded-lg p-6">
                    <div className="flex items-center gap-6">
                      {/* Circular score */}
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-white/5" />
                          <circle
                            cx="50" cy="50" r="42" fill="none" strokeWidth="6" strokeLinecap="round"
                            strokeDasharray={`${(codeResult.security_score / 100) * 264} 264`}
                            className={`${scoreRing(codeResult.security_score)} transition-all duration-700`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-2xl font-black ${scoreColor(codeResult.security_score)}`}>
                            {codeResult.security_score}
                          </span>
                          <span className="text-[10px] text-gray-500 -mt-0.5">/ 100</span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="text-base font-semibold text-white">Security Score</h3>
                        <p className="text-xs text-gray-500">
                          {codeResult.total_lines} lines scanned
                          {codeResult.language_hint && codeResult.language_hint !== "unknown" ? ` — ${codeResult.language_hint}` : ""}
                          {" "}&middot; {codeResult.vulnerabilities.length} issue{codeResult.vulnerabilities.length !== 1 ? "s" : ""} found
                        </p>
                        <div className="flex gap-3 pt-1">
                          {["CRITICAL", "HIGH", "MEDIUM"].map((sev) => (
                            <div key={sev} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-${sev === "CRITICAL" ? "red" : sev === "HIGH" ? "amber" : "yellow"}-500/10 border border-${sev === "CRITICAL" ? "red" : sev === "HIGH" ? "amber" : "yellow"}-500/25`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${sevDots[sev] || "bg-yellow-400"}`} />
                              <span className={`text-xs font-semibold ${sev === "CRITICAL" ? "text-red-400" : sev === "HIGH" ? "text-amber-400" : "text-yellow-400"}`}>
                                {codeResult.summary?.[sev] || 0}
                              </span>
                              <span className="text-[10px] text-gray-500">{sev}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* No issues */}
                  {codeResult.vulnerabilities.length === 0 && (
                    <div className="bg-brand-card border border-white/5 rounded-lg p-8 text-center">
                      <svg className="w-12 h-12 text-emerald-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                      </svg>
                      <h3 className="text-sm font-semibold text-emerald-400">No vulnerabilities detected</h3>
                      <p className="text-xs text-gray-500 mt-1">Your code looks clean. Safe to push!</p>
                    </div>
                  )}

                  {/* Vulnerability list */}
                  {codeResult.vulnerabilities.length > 0 && (
                    <div className="bg-brand-card border border-white/5 rounded-lg p-6 space-y-3">
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                        </svg>
                        Vulnerabilities Found
                      </h3>
                      <div className="space-y-2">
                        {codeResult.vulnerabilities.map((vuln, i) => {
                          const dot = sevDots[vuln.severity] || "bg-yellow-400";
                          const sClass = sevColors[vuln.severity] || sevColors.MEDIUM;
                          return (
                            <div key={i} className="bg-brand-dark border border-white/10 rounded-lg p-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${dot}`} />
                                  <span className="text-sm font-semibold text-white">
                                    {vulnLabels[vuln.type] || vuln.type.replace(/_/g, " ")}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${sClass}`}>
                                    {vuln.severity}
                                  </span>
                                  <span className="text-[11px] text-gray-500">Line {vuln.line}</span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-400">{vuln.description}</p>
                              <pre className="bg-brand-dark border border-white/10 rounded px-3 py-2 text-xs text-red-300/80 font-mono overflow-x-auto">
                                {vuln.code_snippet}
                              </pre>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Next stage button */}
                  {codeResult.vulnerabilities.length > 0 && (
                    <button
                      onClick={() => setActiveStage(3)}
                      className="w-full py-3 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/10"
                    >
                      Next: Get AI Fix
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </button>
                  )}
                </div>
              )}

              {/* Back button */}
              {s1Done && (
                <button
                  onClick={() => setActiveStage(1)}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors mt-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                  </svg>
                  Back to Repo Scanner
                </button>
              )}
            </div>
          )}

          {/* ═══════════════════ STAGE 3: Fix Suggestion ═══════════════════ */}
          {activeStage === 3 && (
            <div className="space-y-4">
              <div className="bg-brand-card border border-white/5 rounded-lg p-6">
                <h2 className="text-base font-semibold text-white mb-1">AI Fix Suggestion</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Gemini AI will rewrite your code with all detected vulnerabilities fixed.
                </p>

                {/* Summary of what will be fixed */}
                {codeResult && (
                  <div className="flex items-center gap-4 p-3 bg-white/[0.02] border border-white/5 rounded-md mb-4">
                    <div className={`text-lg font-bold ${scoreColor(codeResult.security_score)}`}>
                      {codeResult.security_score}/100
                    </div>
                    <div className="text-xs text-gray-400">
                      {codeResult.vulnerabilities.length} vulnerabilities to fix in{" "}
                      <span className="text-gray-300 font-mono">{filename || "untitled"}</span>
                    </div>
                  </div>
                )}

                {/* Fix button */}
                {!fixedCode && (
                  <button
                    onClick={handleFix}
                    disabled={fixLoading}
                    className="w-full py-3 rounded-lg text-sm font-semibold transition-all bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10"
                  >
                    {fixLoading ? (
                      <><Spinner /> Fixing with AI...</>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
                        </svg>
                        Fix All Vulnerabilities with AI
                      </>
                    )}
                  </button>
                )}

                {fixError && (
                  <div className="p-3 bg-red-500/8 border border-red-500/15 rounded-md text-red-400 text-sm mt-3">
                    {fixError}
                  </div>
                )}
              </div>

              {/* Fixed code display */}
              {fixedCode && (
                <div className="bg-brand-card border border-cyan-500/20 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-cyan-500/5">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      <span className="text-sm font-semibold text-cyan-400">AI-Fixed Code</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopy}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all border ${
                          copied
                            ? "bg-emerald-500/15 border-emerald-500/20 text-emerald-400"
                            : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {copied ? (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                            </svg>
                            Copy
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleExport}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Export
                      </button>
                    </div>
                  </div>
                  <pre className="p-5 text-sm text-gray-200 font-mono overflow-x-auto max-h-[500px] overflow-y-auto leading-relaxed">
                    {fixedCode}
                  </pre>
                </div>
              )}

              {/* Back button */}
              <button
                onClick={() => setActiveStage(2)}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Back to Static Analyzer
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
