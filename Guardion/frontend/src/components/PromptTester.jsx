import { useState, useEffect } from "react";
import { analyzePrompt, mlCompare, getQuotaStatus } from "../api";

/**
 * PromptTester Component
 * Tests prompt analysis from the dashboard.
 * Shows: Regex analysis results + Local ML Model vs Gemini side-by-side comparison.
 * Economy-aware: Gemini calls are opt-in to conserve free-tier quota.
 */
export default function PromptTester({ onAnalyzed }) {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [mlResult, setMlResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useGemini, setUseGemini] = useState(false);
  const [quota, setQuota] = useState(null);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Fetch quota status on mount and after each analysis
  const refreshQuota = async () => {
    try {
      const q = await getQuotaStatus();
      setQuota(q);
    } catch {
      // Quota endpoint optional — don't block UI
    }
  };
  useEffect(() => { refreshQuota(); }, []);

  const examplePrompts = [
    {
      label: "API Key Leak",
      text: 'Can you help me debug this code? My API key is sk-1234567890abcdefghijklmnop and the endpoint is https://api.example.com',
    },
    {
      label: "Password Exposure",
      text: 'I need to connect to the database. The password="SuperSecret123!" and the host is db.internal.company.com',
    },
    {
      label: "Safe Prompt",
      text: "How do I implement a binary search algorithm in Python? Please show me an example with comments.",
    },
    {
      label: "Credit Card",
      text: "My credit card number is 4242 4242 4242 4242 and the CVV is 123",
    },
    {
      label: "Private Key",
      text: "Here is my private_key.pem file: -----BEGIN RSA PRIVATE KEY-----",
    },
    {
      label: "PII Leak",
      text: "My email is john@company.com, my phone is +1-555-123-4567, SSN 123-45-6789",
    },
  ];

  const handleAnalyze = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setMlResult(null);
    try {
      // Run both requests in parallel: regex analysis + ML comparison
      // Gemini is only called when toggle is ON (economy mode)
      const [regexData, mlData] = await Promise.all([
        analyzePrompt(prompt, "dashboard", useGemini),
        mlCompare(prompt, useGemini).catch((err) => {
          console.warn("ML Compare failed (model may not be trained):", err);
          return null;
        }),
      ]);
      setResult(regexData);
      setMlResult(mlData);
      onAnalyzed?.();
      // Refresh quota after analysis
      refreshQuota();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const decisionStyles = {
    allow: {
      bg: "bg-emerald-500/8",
      border: "border-emerald-500/20",
      text: "text-emerald-400",
      label: "ALLOWED",
    },
    warn: {
      bg: "bg-amber-500/8",
      border: "border-amber-500/20",
      text: "text-amber-400",
      label: "WARNING",
    },
    block: {
      bg: "bg-red-500/8",
      border: "border-red-500/20",
      text: "text-red-400",
      label: "BLOCKED",
    },
  };

  const mlDecisionStyles = {
    ALLOW: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" },
    WARN: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400" },
    BLOCK: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400" },
  };

  // Format category label for display
  const formatCategory = (cat) => cat?.replace(/_/g, " ").toUpperCase() || "UNKNOWN";

  return (
    <div className="space-y-4">
      {/* Input Section */}
      <div className="bg-brand-card border border-white/5 rounded-lg p-6">
        <h2 className="text-base font-semibold text-white mb-0.5">
          Prompt Security Tester
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Test how Guardion detects sensitive information and injection attacks in AI prompts.
        </p>

        {/* Example prompts */}
        <div className="flex flex-wrap gap-2 mb-4">
          {examplePrompts.map((ex) => (
            <button
              key={ex.label}
              onClick={() => setPrompt(ex.text)}
              className="px-3 py-1.5 text-xs bg-brand-dark hover:bg-brand-card border border-white/5 rounded-md text-gray-400 hover:text-gray-300 transition font-medium"
            >
              {ex.label}
            </button>
          ))}
        </div>

        {/* Economy Mode: Gemini Toggle + Quota Status */}
        <div className="flex items-center justify-between mb-4 p-3 bg-brand-dark border border-white/5 rounded-lg">
          <div className="flex items-center gap-3">
            {/* Toggle */}
            <button
              onClick={() => setUseGemini(!useGemini)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                useGemini ? "bg-brand-orange" : "bg-slate-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  useGemini ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <div>
              <span className="text-sm text-gray-300 font-medium">
                {useGemini ? "Gemini ON" : "Gemini OFF"}
              </span>
              <p className="text-[11px] text-gray-500">
                {useGemini
                  ? "Uses API quota — cached results are free"
                  : "Economy mode — regex + local ML only (no API cost)"}
              </p>
            </div>
          </div>

          {/* Quota indicator */}
          {quota && (
            <div className="flex items-center gap-3 text-xs">
              {quota.rate_limiter?.in_cooldown ? (
                <span className="px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-red-400">
                  Quota Cooldown
                </span>
              ) : (
                <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-gray-400">
                  {quota.rate_limiter?.calls_remaining}/{quota.rate_limiter?.max_calls_per_minute} calls/min
                </span>
              )}
              <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-gray-400">
                Cache: {quota.cache?.hits || 0} hits ({Math.round((quota.cache?.hit_rate || 0) * 100)}%)
              </span>
            </div>
          )}
        </div>

        {/* Textarea */}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt to analyze for sensitive data..."
          className="w-full h-32 bg-brand-dark border border-white/5 rounded-md p-4 text-slate-200 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan/50 resize-none"
        />

        {/* Analyze button */}
        <button
          onClick={handleAnalyze}
          disabled={loading || !prompt.trim()}
          className="mt-3 px-5 py-2 bg-brand-orange hover:bg-brand-orange-light text-white text-sm font-medium rounded-md shadow-glow-orange-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Analyzing...
            </span>
          ) : (
            "Analyze Prompt"
          )}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-500/8 border border-red-500/15 rounded-md text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* ── ML Model vs Gemini Side-by-Side ── */}
      {mlResult && (
        <div className="bg-brand-card border border-white/5 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
              </svg>
              {mlResult.gemini_analysis ? "ML Model vs Gemini — Side by Side" : "ML Model Analysis"}
            </h3>
            {/* Agreement badge — only when Gemini is active */}
            {mlResult.gemini_analysis && (
              mlResult.agreement ? (
                <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/25 rounded-full text-xs text-emerald-400 font-semibold">
                  MODELS AGREE
                </span>
              ) : (
                <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/25 rounded-full text-xs text-amber-400 font-semibold">
                  MODELS DISAGREE
                </span>
              )
            )}
          </div>

          {/* Side-by-side cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Local ML Model Card */}
            <div className="bg-brand-dark border border-white/5 rounded-lg p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                <h4 className="text-sm font-semibold text-purple-300 uppercase tracking-wider">
                  Local ML Model
                </h4>
              </div>
              <p className="text-[11px] text-gray-500">
                sentence-transformers + logistic regression
              </p>

              {/* Prediction */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Prediction</span>
                  <span className="px-2.5 py-0.5 bg-purple-500/10 border border-purple-500/25 rounded text-xs text-purple-300 font-bold">
                    {formatCategory(mlResult.local_model?.prediction)}
                  </span>
                </div>

                {/* Confidence bar */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">Confidence</span>
                    <span className="text-sm font-bold text-white">
                      {((mlResult.local_model?.confidence || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(mlResult.local_model?.confidence || 0) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Per-class scores */}
                {mlResult.local_model?.all_scores && (
                  <div className="pt-2 space-y-1.5">
                    <span className="text-[11px] text-gray-500 uppercase tracking-wider">Class Probabilities</span>
                    {Object.entries(mlResult.local_model.all_scores)
                      .sort(([, a], [, b]) => b - a)
                      .map(([label, score]) => (
                        <div key={label} className="flex items-center gap-2">
                          <span className="text-[11px] text-gray-400 w-28 truncate">
                            {formatCategory(label)}
                          </span>
                          <div className="flex-1 bg-white/5 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-500 ${
                                label === mlResult.local_model.prediction
                                  ? "bg-purple-400"
                                  : "bg-slate-500/50"
                              }`}
                              style={{ width: `${score * 100}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-gray-500 w-10 text-right">
                            {(score * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Gemini Analysis Card — only shown when Gemini is enabled */}
            {mlResult.gemini_analysis && (
            <div className="bg-brand-dark border border-white/5 rounded-lg p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-brand-cyan"></div>
                <h4 className="text-sm font-semibold text-brand-cyan uppercase tracking-wider">
                  Gemini API Analysis
                </h4>
                {mlResult.gemini_analysis?.from_cache && (
                  <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] text-emerald-400 font-semibold">
                    CACHED
                  </span>
                )}
                {mlResult.gemini_analysis?.rate_limited && (
                  <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] text-amber-400 font-semibold">
                    RATE LIMITED
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500">
                gemini-2.5-flash calibrated classification
              </p>

              {/* Prediction */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Prediction</span>
                  <span className="px-2.5 py-0.5 bg-brand-cyan/10 border border-brand-cyan/25 rounded text-xs text-brand-cyan font-bold">
                    {formatCategory(mlResult.gemini_analysis?.prediction)}
                  </span>
                </div>

                {/* Confidence bar */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">Confidence</span>
                    <span className="text-sm font-bold text-white">
                      {((mlResult.gemini_analysis?.confidence || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div
                      className="bg-brand-cyan h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(mlResult.gemini_analysis?.confidence || 0) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Per-class scores (mirrors local model layout) */}
                {mlResult.gemini_analysis?.all_scores && (
                  <div className="pt-2 space-y-1.5">
                    <span className="text-[11px] text-gray-500 uppercase tracking-wider">Class Probabilities</span>
                    {Object.entries(mlResult.gemini_analysis.all_scores)
                      .sort(([, a], [, b]) => b - a)
                      .map(([label, score]) => (
                        <div key={label} className="flex items-center gap-2">
                          <span className="text-[11px] text-gray-400 w-28 truncate">
                            {formatCategory(label)}
                          </span>
                          <div className="flex-1 bg-white/5 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-500 ${
                                label === mlResult.gemini_analysis.prediction
                                  ? "bg-brand-cyan"
                                  : "bg-slate-500/50"
                              }`}
                              style={{ width: `${score * 100}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-gray-500 w-10 text-right">
                            {(score * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                  </div>
                )}

                {/* Gemini explanation */}
                {mlResult.gemini_analysis?.explanation && (
                  <div className="pt-2">
                    <span className="text-[11px] text-gray-500 uppercase tracking-wider">Explanation</span>
                    <p className="mt-1 text-xs text-gray-300 leading-relaxed bg-brand-dark rounded p-2.5 border border-white/5">
                      {mlResult.gemini_analysis.explanation}
                    </p>
                  </div>
                )}

                {/* Error message if Gemini failed */}
                {mlResult.gemini_analysis?.error && (
                  <div className="pt-2 p-2.5 bg-amber-500/5 border border-amber-500/15 rounded text-xs text-amber-400">
                    {mlResult.gemini_analysis.explanation || "Gemini unavailable — showing local model result only"}
                  </div>
                )}
              </div>
            </div>
            )}
          </div>

          {/* Combined Decision Banner */}
          {(() => {
            const style = mlDecisionStyles[mlResult.decision] || mlDecisionStyles.WARN;
            return (
              <div className={`${style.bg} ${style.border} border rounded-lg p-4 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  {mlResult.decision === "ALLOW" && (
                    <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  )}
                  {mlResult.decision === "WARN" && (
                    <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                  )}
                  {mlResult.decision === "BLOCK" && (
                    <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  )}
                  <div>
                    <span className={`text-sm font-bold ${style.text}`}>
                      {mlResult.gemini_analysis ? "COMBINED DECISION" : "ML MODEL DECISION"}: {mlResult.decision}
                    </span>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {mlResult.gemini_analysis ? "Strictest outcome from both models is applied" : "Based on local ML model only (Gemini OFF)"}
                    </p>
                  </div>
                </div>
                <div className={`text-2xl font-black ${style.text}`}>
                  {mlResult.decision === "BLOCK" ? "🛑" : mlResult.decision === "WARN" ? "⚠️" : "✅"}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── Regex Analysis Results ── */}
      {result && (
        <div className="bg-brand-card border border-white/5 rounded-lg p-6 space-y-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-cyan" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
            Combined Analysis (Regex + ML{result.reason ? " + Gemini" : ""})
          </h3>

          {/* ML Model Inline Prediction (from main pipeline) */}
          {result.ml_prediction && result.ml_prediction.prediction && (
            <div className="flex items-center gap-3 p-3 bg-purple-500/5 border border-purple-500/15 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-purple-400"></div>
              <span className="text-xs text-purple-300 font-semibold uppercase tracking-wider">
                ML Model
              </span>
              <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/25 rounded text-xs text-purple-300 font-bold">
                {formatCategory(result.ml_prediction.prediction)}
              </span>
              <span className="text-xs text-gray-400">
                {((result.ml_prediction.confidence || 0) * 100).toFixed(1)}% confidence
              </span>
            </div>
          )}

          {/* Decision banner */}
          {(() => {
            const style = decisionStyles[result.decision] || decisionStyles.allow;
            return (
              <div
                className={`${style.bg} ${style.border} border rounded-md p-4 flex items-center justify-between`}
              >
                <div className="flex items-center gap-2">
                  {result.decision === "allow" && (
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  )}
                  {result.decision === "warn" && (
                    <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                  )}
                  {result.decision === "block" && (
                    <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  )}
                  <span className={`text-sm font-semibold ${style.text}`}>
                    {style.label}
                  </span>
                </div>
                <span className={`text-xl font-bold ${style.text}`}>
                  {(result.risk_score * 100).toFixed(0)}%
                </span>
              </div>
            );
          })()}

          {/* Detected categories */}
          {result.detected_categories?.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Detected Categories
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.detected_categories.map((cat) => (
                  <span
                    key={cat}
                    className="px-2.5 py-1 bg-red-500/8 border border-red-500/15 rounded-md text-xs text-red-300 font-medium"
                  >
                    {cat.replace(/_/g, " ").toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sanitized prompt */}
          {result.sanitized_prompt && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sanitized Output
                </h4>
                <button
                  onClick={() => copyToClipboard(result.sanitized_prompt)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/15 text-gray-300 hover:text-white"
                >
                  {copied ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Copied
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
              </div>
              <pre className="bg-brand-dark border border-white/5 rounded-md p-4 text-sm text-emerald-300/90 whitespace-pre-wrap overflow-auto max-h-48 font-mono select-all">
                {result.sanitized_prompt}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
