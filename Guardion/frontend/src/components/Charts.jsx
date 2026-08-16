import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { motion } from "framer-motion";

// ── Custom tooltip ──
const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d0d0d] border border-white/10 rounded-lg px-3.5 py-2.5 shadow-2xl shadow-black/50 backdrop-blur-xl">
      {label && (
        <p className="text-[11px] text-gray-500 mb-1 font-medium">{label}</p>
      )}
      {payload.map((p, i) => (
        <p
          key={i}
          className="text-sm font-semibold"
          style={{ color: p.color || p.fill }}
        >
          {p.name}: <span className="text-white">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ── Custom pie label ──
const renderPieLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  name,
  value,
  percent,
}) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 22;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#9ca3af"
      fontSize={11}
      fontWeight={500}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {name} ({value})
    </text>
  );
};

export default function Charts({
  promptMetrics,
  repoMetrics,
  recentScans = [],
}) {
  // ── Prompt donut data ──
  const promptData = [
    { name: "Allowed", value: promptMetrics?.allowed || 0, color: "#06b6d4" },
    { name: "Warnings", value: promptMetrics?.warnings || 0, color: "#f97316" },
    { name: "Blocked", value: promptMetrics?.blocked || 0, color: "#ef4444" },
  ].filter((d) => d.value > 0);
  const totalPrompts = promptData.reduce((s, d) => s + d.value, 0);
  const hasPromptData = totalPrompts > 0;

  // ── Vulnerability bar data ──
  const vulnData = [
    {
      name: "Critical",
      count: repoMetrics?.critical || 0,
      fill: "url(#gradCritical)",
    },
    {
      name: "High",
      count: repoMetrics?.high || 0,
      fill: "url(#gradHigh)",
    },
    {
      name: "Medium",
      count: repoMetrics?.medium || 0,
      fill: "url(#gradMedium)",
    },
    {
      name: "Low",
      count: repoMetrics?.low || 0,
      fill: "url(#gradLow)",
    },
  ];
  const hasVulnData = vulnData.some((d) => d.count > 0);

  // ── Security score trend from recent scans ──
  const scoreTrend = [...(recentScans || [])]
    .reverse()
    .slice(-8)
    .map((s, i) => ({
      scan: s.repo_url
        ? s.repo_url.split("/").pop()?.slice(0, 12)
        : `Scan ${i + 1}`,
      score: s.security_score || 0,
      vulns: s.total_vulnerabilities || 0,
    }));
  const hasScoreTrend = scoreTrend.length > 0;

  // ── Security posture gauge ──
  const totalVulns = repoMetrics?.total_vulnerabilities || 0;
  const criticalHigh =
    (repoMetrics?.critical || 0) + (repoMetrics?.high || 0);
  const posture =
    totalVulns === 0
      ? 100
      : Math.max(
          0,
          Math.min(
            100,
            100 - criticalHigh * 12 - (repoMetrics?.medium || 0) * 4
          )
        );
  const postureColor =
    posture >= 75 ? "#10b981" : posture >= 45 ? "#f59e0b" : "#ef4444";
  const postureLabel =
    posture >= 75 ? "Strong" : posture >= 45 ? "Moderate" : "At Risk";
  const radialData = [{ name: "Posture", value: posture, fill: postureColor }];

  // ── Card wrapper ──
  const Card = ({ children, delay = 0, className = "" }) => (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className={`bg-brand-card border border-white/5 rounded-xl p-5 hover:border-white/[0.08] transition-colors relative overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );

  const CardHeader = ({ icon, iconBg, label }) => (
    <div className="flex items-center gap-2 mb-4">
      <div
        className={`w-7 h-7 ${iconBg} rounded-lg flex items-center justify-center`}
      >
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-gray-400 tracking-wide">
        {label}
      </h3>
    </div>
  );

  const EmptyState = ({ icon, text }) => (
    <div className="flex flex-col items-center justify-center h-[220px] text-gray-600">
      {icon}
      <span className="text-xs mt-2">{text}</span>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* ── Row 1: Donut + Bar ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Prompt Risk Donut */}
        <Card delay={0}>
          <CardHeader
            iconBg="bg-brand-cyan/10"
            icon={
              <svg
                className="w-3.5 h-3.5 text-brand-cyan"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z"
                />
              </svg>
            }
            label="Prompt Risk Distribution"
          />
          {hasPromptData ? (
            <div className="relative">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <defs>
                    <filter
                      id="glowCyan"
                      x="-20%"
                      y="-20%"
                      width="140%"
                      height="140%"
                    >
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite
                        in="SourceGraphic"
                        in2="blur"
                        operator="over"
                      />
                    </filter>
                  </defs>
                  <Pie
                    data={promptData}
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    strokeWidth={0}
                    label={renderPieLabel}
                    animationBegin={100}
                    animationDuration={800}
                  >
                    {promptData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.color}
                        style={{ filter: "url(#glowCyan)" }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<DarkTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center stat */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-white">
                  {totalPrompts}
                </span>
                <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">
                  Total
                </span>
              </div>
              {/* Custom legend */}
              <div className="flex items-center justify-center gap-5 -mt-2">
                {promptData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="text-[11px] text-gray-500">{d.name}</span>
                    <span className="text-[11px] font-semibold text-gray-300">
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={
                <svg
                  className="w-10 h-10 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z"
                  />
                </svg>
              }
              text="No prompt data yet"
            />
          )}
        </Card>

        {/* Vulnerability Severity Bar */}
        <Card delay={0.08}>
          <CardHeader
            iconBg="bg-brand-orange/10"
            icon={
              <svg
                className="w-3.5 h-3.5 text-brand-orange"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                />
              </svg>
            }
            label="Vulnerability Severity"
          />
          {hasVulnData ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={vulnData} barCategoryGap="25%">
                <defs>
                  <linearGradient id="gradCritical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id="gradHigh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={1} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id="gradMedium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#eab308" stopOpacity={1} />
                    <stop offset="100%" stopColor="#eab308" stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id="gradLow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={1} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.03)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#6b7280", fontSize: 11, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#4b5563", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={<DarkTooltip />}
                  cursor={{ fill: "rgba(255,255,255,0.02)" }}
                />
                <Bar
                  dataKey="count"
                  radius={[6, 6, 0, 0]}
                  animationBegin={200}
                  animationDuration={700}
                >
                  {vulnData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              icon={
                <svg
                  className="w-10 h-10 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75Z"
                  />
                </svg>
              }
              text="No vulnerability data yet"
            />
          )}
        </Card>
      </div>

      {/* ── Row 2: Score Trend + Security Posture ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Security Score Trend */}
        <Card delay={0.15} className="md:col-span-2">
          <CardHeader
            iconBg="bg-emerald-500/10"
            icon={
              <svg
                className="w-3.5 h-3.5 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
                />
              </svg>
            }
            label="Security Score Trend"
          />
          {hasScoreTrend ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={scoreTrend}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.03)"
                  vertical={false}
                />
                <XAxis
                  dataKey="scan"
                  tick={{ fill: "#4b5563", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "#4b5563", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<DarkTooltip />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fill="url(#scoreGrad)"
                  dot={{
                    r: 4,
                    fill: "#06b6d4",
                    stroke: "#0d0d0d",
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 6,
                    fill: "#06b6d4",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              icon={
                <svg
                  className="w-10 h-10 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22"
                  />
                </svg>
              }
              text="Scan a repository to see score trends"
            />
          )}
        </Card>

        {/* Security Posture Gauge */}
        <Card delay={0.22}>
          <CardHeader
            iconBg="bg-purple-500/10"
            icon={
              <svg
                className="w-3.5 h-3.5 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                />
              </svg>
            }
            label="Security Posture"
          />
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={170}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="65%"
                outerRadius="90%"
                startAngle={210}
                endAngle={-30}
                data={radialData}
              >
                <RadialBar
                  background={{ fill: "rgba(255,255,255,0.04)" }}
                  dataKey="value"
                  cornerRadius={8}
                  animationDuration={1200}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="-mt-[110px] flex flex-col items-center relative z-10 mb-4">
              <span
                className="text-3xl font-black"
                style={{ color: postureColor }}
              >
                {posture}
              </span>
              <span
                className="text-[10px] font-bold tracking-widest uppercase mt-0.5"
                style={{ color: postureColor }}
              >
                {postureLabel}
              </span>
            </div>
            {/* Posture stats */}
            <div className="w-full grid grid-cols-2 gap-2 mt-2">
              <div className="bg-white/[0.02] rounded-md p-2 text-center border border-white/5">
                <div className="text-base font-bold text-white">
                  {totalVulns}
                </div>
                <div className="text-[10px] text-gray-500">Total Vulns</div>
              </div>
              <div className="bg-white/[0.02] rounded-md p-2 text-center border border-white/5">
                <div className="text-base font-bold text-red-400">
                  {criticalHigh}
                </div>
                <div className="text-[10px] text-gray-500">Critical+High</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
