/**
 * MetricsCards Component
 * Cybersecurity themed metric cards with orange/cyan accents and stagger animation.
 */
import { motion } from "framer-motion";

export default function MetricsCards({ promptMetrics, repoMetrics }) {
  const cards = [
    {
      label: "Prompts Analyzed",
      value: promptMetrics?.total_prompts || 0,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      ),
      color: "cyan",
    },
    {
      label: "Prompts Blocked",
      value: promptMetrics?.blocked || 0,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
      color: "red",
    },
    {
      label: "Warnings Issued",
      value: promptMetrics?.warnings || 0,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      ),
      color: "orange",
    },
    {
      label: "Credential Leaks",
      value: promptMetrics?.credential_leaks || 0,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
        </svg>
      ),
      color: "orange",
    },
    {
      label: "Repos Scanned",
      value: repoMetrics?.total_scans || 0,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
        </svg>
      ),
      color: "cyan",
    },
    {
      label: "Vulnerabilities",
      value: repoMetrics?.total_vulnerabilities || 0,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75c1.148 0 2.278.08 3.383.237 1.037.146 1.866.966 1.866 2.013 0 3.728-2.35 6.75-5.25 6.75S6.75 18.728 6.75 15c0-1.046.83-1.867 1.866-2.013A24.204 24.204 0 0 1 12 12.75Z" />
        </svg>
      ),
      color: "red",
    },
    {
      label: "Critical Issues",
      value: repoMetrics?.critical || 0,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      ),
      color: "red",
    },
    {
      label: "High Severity",
      value: repoMetrics?.high || 0,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      ),
      color: "orange",
    },
  ];

  const colorStyles = {
    cyan: {
      iconBg: "bg-brand-cyan/10",
      iconText: "text-brand-cyan",
      accent: "border-l-brand-cyan",
      glow: "hover:shadow-[0_0_20px_rgba(6,182,212,0.08)]",
    },
    orange: {
      iconBg: "bg-brand-orange/10",
      iconText: "text-brand-orange",
      accent: "border-l-brand-orange",
      glow: "hover:shadow-[0_0_20px_rgba(249,115,22,0.08)]",
    },
    red: {
      iconBg: "bg-red-500/10",
      iconText: "text-red-400",
      accent: "border-l-red-500",
      glow: "hover:shadow-[0_0_20px_rgba(239,68,68,0.08)]",
    },
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((card, i) => {
        const cs = colorStyles[card.color];
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className={`group relative bg-brand-card rounded-lg p-4 border border-white/5 border-l-2 ${cs.accent} ${cs.glow} transition-all duration-200 overflow-hidden`}
          >
            {/* Subtle gradient hover glow */}
            <div className={`absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-transparent group-hover:to-white/[0.02] transition-all duration-300`} />
            <div className="relative flex items-center justify-between mb-3">
              <div className={`w-9 h-9 ${cs.iconBg} rounded-lg flex items-center justify-center ${cs.iconText} ring-1 ring-white/5`}>
                {card.icon}
              </div>
            </div>
            <div className="relative text-2xl font-bold text-white tracking-tight">
              {card.value}
            </div>
            <div className="relative text-xs text-gray-500 mt-1 font-medium">{card.label}</div>
          </motion.div>
        );
      })}
    </div>
  );
}
