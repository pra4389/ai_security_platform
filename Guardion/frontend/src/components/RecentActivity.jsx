/**
 * RecentActivity Component — Cybersecurity themed.
 */
import { motion } from "framer-motion";

export default function RecentActivity({ recentPrompts, recentScans }) {
  const decisionBadge = (decision) => {
    const styles = {
      allow: "bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20",
      warn: "bg-brand-orange/10 text-brand-orange border-brand-orange/20",
      block: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return styles[decision] || styles.allow;
  };

  const scoreColor = (score) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-brand-orange";
    if (score >= 40) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Recent Prompts */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-brand-card border border-white/5 rounded-lg p-5 hover:border-white/8 transition-colors"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-cyan/10 rounded flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-brand-cyan" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-400">
              Recent Prompt Analyses
            </h3>
          </div>
          {recentPrompts?.length > 0 && (
            <span className="text-[10px] text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">
              {recentPrompts.length}
            </span>
          )}
        </div>

        {recentPrompts?.length > 0 ? (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {recentPrompts.map((p) => (
              <div
                key={p.id}
                className="bg-brand-dark border border-white/5 rounded-md p-3"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${decisionBadge(
                      p.decision
                    )}`}
                  >
                    {p.decision?.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-gray-600 font-medium">{p.source}</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {p.prompt_preview}
                </p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-[11px] text-gray-600">
                    Risk: {((p.risk_score || 0) * 100).toFixed(0)}%
                  </span>
                  {p.categories && (
                    <span className="text-[11px] text-red-400/60 truncate max-w-[140px]">
                      {p.categories}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-600">
            <svg className="w-10 h-10 text-gray-700 mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
            <span className="text-sm">No prompt analyses yet</span>
            <span className="text-xs text-gray-700 mt-1">Use the Prompt Security tab to analyze prompts</span>
          </div>
        )}
      </motion.div>

      {/* Recent Scans */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-brand-card border border-white/5 rounded-lg p-5 hover:border-white/8 transition-colors"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-orange/10 rounded flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-brand-orange" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-400">
              Recent Repository Scans
            </h3>
          </div>
          {recentScans?.length > 0 && (
            <span className="text-[10px] text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">
              {recentScans.length}
            </span>
          )}
        </div>

        {recentScans?.length > 0 ? (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {recentScans.map((s) => (
              <div
                key={s.id}
                className="bg-brand-dark border border-white/5 rounded-md p-3"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-brand-cyan font-mono truncate max-w-[200px]">
                    {s.repo_url?.replace("https://github.com/", "")}
                  </span>
                  <span
                    className={`text-sm font-semibold ${scoreColor(
                      s.security_score
                    )}`}
                  >
                    {s.security_score}/100
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-gray-500">
                  <span>{s.dependencies_scanned} deps</span>
                  <span>{s.total_vulnerabilities} vulns</span>
                  {s.critical > 0 && (
                    <span className="text-red-400">{s.critical} critical</span>
                  )}
                  {s.high > 0 && (
                    <span className="text-brand-orange">{s.high} high</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-600">
            <svg className="w-10 h-10 text-gray-700 mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <span className="text-sm">No repository scans yet</span>
            <span className="text-xs text-gray-700 mt-1">Use the Repo Scanner tab to scan repositories</span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
