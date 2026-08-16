/**
 * Admin Dashboard — Guardion
 * Platform-wide monitoring: users, stats, logs.
 */

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { adminGetUsers, adminGetStats, adminGetPromptLogs } from "../api";

export default function AdminDashboard() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("stats");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard");
      return;
    }
    loadData();
  }, [isAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, u, l] = await Promise.all([
        adminGetStats(),
        adminGetUsers(),
        adminGetPromptLogs(1, 10),
      ]);
      setStats(s);
      setUsers(u);
      setLogs(l);
    } catch (err) {
      console.error("Admin data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats
    ? [
        { label: "Total Users", value: stats.total_users, color: "orange" },
        { label: "Prompts Analyzed", value: stats.total_prompts, color: "cyan" },
        { label: "Repo Scans", value: stats.total_repo_scans, color: "orange" },
        { label: "Code Scans", value: stats.total_code_scans, color: "cyan" },
        { label: "Threats Detected", value: stats.threats_detected, color: "red" },
        { label: "Avg Risk Score", value: stats.avg_risk_score, color: "amber" },
        { label: "Active (30d)", value: stats.active_users_30d, color: "emerald" },
      ]
    : [];

  const colorMap = {
    orange: "from-brand-orange/15 to-brand-orange/5 border-brand-orange/20 text-brand-orange",
    cyan: "from-brand-cyan/15 to-brand-cyan/5 border-brand-cyan/20 text-brand-cyan",
    red: "from-red-500/20 to-red-600/10 border-red-500/20 text-red-400",
    amber: "from-amber-500/20 to-amber-600/10 border-amber-500/20 text-amber-400",
    emerald: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 text-emerald-400",
  };

  return (
    <div className="min-h-screen bg-page">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-orange rounded-lg flex items-center justify-center shadow-md shadow-brand-orange/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white leading-none">Guardion Admin</h1>
              <p className="text-[11px] text-gray-500 mt-0.5">Platform Monitoring</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="text-xs text-brand-cyan px-2.5 py-1 bg-brand-cyan/10 border border-brand-cyan/20 rounded-md font-medium transition-colors hover:bg-brand-cyan/20"
            >
              ← Dashboard
            </Link>
            <span className="text-xs bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-md font-medium text-red-400">
              Admin
            </span>
            <span className="text-xs text-gray-400">{user?.name}</span>
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 bg-white/5 border border-white/10 rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <nav className="flex space-x-1 bg-brand-card border border-white/5 rounded-lg p-1">
          {["stats", "users", "logs"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${
                activeTab === tab
                  ? "bg-brand-orange/15 text-brand-orange border border-brand-orange/20 shadow-sm"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              }`}
            >
              {tab === "stats" ? "Overview" : tab === "users" ? "Users" : "Activity Logs"}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-orange/30 border-t-brand-orange"></div>
          </div>
        ) : (
          <>
            {/* Stats Tab */}
            {activeTab === "stats" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {statCards.map((c, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-xl bg-gradient-to-br border ${colorMap[c.color]}`}
                    >
                      <div className="text-2xl font-bold">{c.value}</div>
                      <div className="text-[11px] opacity-70 mt-1 font-medium">{c.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="bg-brand-card border border-white/5 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-brand-dark text-gray-400 text-left text-xs uppercase tracking-wider">
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3 text-center">Prompts</th>
                      <th className="px-4 py-3 text-center">Repo Scans</th>
                      <th className="px-4 py-3 text-center">Code Scans</th>
                      <th className="px-4 py-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((u) => (
                      <tr key={u.id} className="text-gray-300 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-medium text-white">{u.name}</td>
                        <td className="px-4 py-3">{u.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              u.role === "admin"
                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">{u.prompt_count}</td>
                        <td className="px-4 py-3 text-center">{u.repo_scan_count}</td>
                        <td className="px-4 py-3 text-center">{u.code_scan_count}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                          No users registered yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Logs Tab */}
            {activeTab === "logs" && (
              <div className="bg-brand-card border border-white/5 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5 text-xs text-gray-400">
                  Showing {logs.items.length} of {logs.total} prompt analysis logs
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-brand-dark text-gray-400 text-left text-xs uppercase tracking-wider">
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Prompt Preview</th>
                      <th className="px-4 py-3 text-center">Risk</th>
                      <th className="px-4 py-3">Decision</th>
                      <th className="px-4 py-3">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {logs.items.map((log, i) => (
                      <tr key={i} className="text-gray-300 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-xs text-gray-400">{log.user_id || "—"}</td>
                        <td className="px-4 py-3 max-w-xs truncate text-xs">
                          {(log.prompt_text || "").substring(0, 60)}...
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`font-mono text-xs font-bold ${
                              (log.risk_score || 0) >= 70
                                ? "text-red-400"
                                : (log.risk_score || 0) >= 40
                                ? "text-amber-400"
                                : "text-emerald-400"
                            }`}
                          >
                            {log.risk_score ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              log.decision === "block"
                                ? "bg-red-500/10 text-red-400"
                                : log.decision === "warn"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-emerald-500/10 text-emerald-400"
                            }`}
                          >
                            {log.decision || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {log.created_at
                            ? new Date(log.created_at).toLocaleString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                    {logs.items.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                          No prompt logs yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
