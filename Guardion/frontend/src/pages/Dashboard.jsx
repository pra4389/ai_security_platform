/**
 * Client Dashboard — Guardion
 * Dark cybersecurity themed dashboard with orange/cyan accents.
 */

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../AuthContext";
import { fetchDashboard } from "../api";
import MetricsCards from "../components/MetricsCards";
import PromptTester from "../components/PromptTester";
import SecurityPipeline from "../components/SecurityPipeline";
import RecentActivity from "../components/RecentActivity";
import Charts from "../components/Charts";
import OwaspTrending from "../components/OwaspTrending";

export default function Dashboard() {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await fetchDashboard();
      setDashboard(data);
      setError(null);
    } catch (err) {
      setError("Failed to connect to Guardion backend. Is the server running?");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
        </svg>
      ),
    },
    {
      id: "prompts",
      label: "Prompt Security",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
      ),
    },
    {
      id: "pipeline",
      label: "Security Pipeline",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-brand-black">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-brand-orange rounded-lg flex items-center justify-center shadow-glow-orange-sm">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-white leading-none font-poppins">
                  Guardion
                </h1>
                <p className="text-[11px] text-gray-600 mt-0.5 font-medium">
                  Security Intelligence Platform
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 text-xs text-brand-orange px-3 py-1.5 bg-brand-orange/10 border border-brand-orange/20 rounded-md font-semibold transition-all hover:bg-brand-orange/20 hover:shadow-glow-orange-sm"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                  </svg>
                  Admin Panel
                </Link>
              )}
              <span className="flex items-center gap-2 px-3 py-1.5 bg-brand-cyan/5 border border-brand-cyan/15 rounded-md text-xs text-brand-cyan font-medium">
                <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-pulse"></span>
                Active
              </span>
              {isAuthenticated && (
                <>
                  <span className="text-xs text-gray-400">{user?.name}</span>
                  <button
                    onClick={() => { logout(); navigate("/"); }}
                    className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 bg-white/5 border border-white/10 rounded-md hover:bg-white/10"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav className="flex space-x-1 bg-brand-card/80 backdrop-blur border border-white/5 rounded-xl p-1.5 shadow-lg shadow-black/20">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-gradient-to-b from-brand-orange/20 to-brand-orange/10 text-brand-orange shadow-sm shadow-brand-orange/10 border border-brand-orange/20"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              }`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-brand-orange rounded-full" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-500/8 border border-red-500/15 rounded-lg p-4 text-red-400 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading && !dashboard ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-orange/30 border-t-brand-orange"></div>
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "overview" && dashboard && (
              <div className="space-y-6">
                {/* Welcome Banner */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="relative overflow-visible bg-gradient-to-r from-brand-card via-brand-card to-brand-orange/5 border border-white/5 rounded-lg p-6"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/3 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                  <div className="relative flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-white tracking-tight">
                        Welcome back{user?.name ? `, ${user.name}` : ""}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Your security overview at a glance. Monitoring prompts, repositories, and threat intelligence.
                      </p>
                      <div className="mt-3">
                        <OwaspTrending />
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-[11px] text-gray-500">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      Auto-refreshing every 30s
                    </div>
                  </div>
                </motion.div>

                <MetricsCards
                  promptMetrics={dashboard.prompt_metrics}
                  repoMetrics={dashboard.repo_metrics}
                />
                <Charts
                  promptMetrics={dashboard.prompt_metrics}
                  repoMetrics={dashboard.repo_metrics}
                  recentScans={dashboard.recent_scans}
                />
                <RecentActivity
                  recentPrompts={dashboard.recent_prompts}
                  recentScans={dashboard.recent_scans}
                />
              </div>
            )}

            {activeTab === "prompts" && (
              <PromptTester onAnalyzed={loadDashboard} />
            )}

            {activeTab === "pipeline" && (
              <SecurityPipeline onScanned={loadDashboard} />
            )}
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-700 text-xs border-t border-white/5">
        <span className="text-brand-orange font-semibold">Guardion</span> v2.0 &middot; AI Prompt Security & Repository Vulnerability Scanner
      </footer>
    </div>
  );
}
