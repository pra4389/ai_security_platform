/**
 * Landing Page — Guardion
 * Futuristic cybersecurity SaaS landing with animated sections.
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-brand-black text-white overflow-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 cyber-grid animate-grid-fade pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-brand-orange/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-brand-cyan/5 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="max-w-5xl mx-auto text-center relative z-10"
        >
          <motion.div variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-orange/10 border border-brand-orange/20 rounded-full text-brand-orange text-xs font-semibold tracking-wide mb-8">
              <span className="w-1.5 h-1.5 bg-brand-orange rounded-full animate-pulse" />
              AI-Powered Security Platform
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="text-hero-sm md:text-hero font-poppins font-extrabold leading-tight mb-6"
          >
            Protect Your AI Prompts
            <br />
            <span className="text-gradient-mixed">Before They Leak</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Guardion detects sensitive data in AI prompts, scans repositories for
            vulnerabilities, and audits code before you push — all powered by ML
            and Gemini AI.
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={3}
            className="flex items-center justify-center gap-4"
          >
            <Link
              to="/signup"
              className="px-8 py-3.5 bg-brand-orange hover:bg-brand-orange-light text-base font-semibold rounded-lg transition-all duration-200 shadow-glow-orange hover:shadow-glow-orange-lg hover:scale-105"
            >
              Start Free
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 bg-brand-card hover:bg-white/10 border border-white/10 text-base font-medium rounded-lg transition-all duration-200 hover:border-brand-cyan/30"
            >
              Sign In
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="text-center mb-14"
        >
          <motion.h2
            variants={fadeUp}
            className="text-section-sm md:text-section font-poppins font-bold mb-4"
          >
            Complete Security <span className="text-brand-cyan">Pipeline</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-gray-500 max-w-xl mx-auto">
            Three layers of protection for your AI workflow — from prompt to push.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
          className="grid md:grid-cols-3 gap-5"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              custom={i}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="group p-6 rounded-xl bg-brand-card border border-white/5 hover:border-brand-cyan/20 transition-all duration-300 hover:shadow-glow-cyan-sm"
            >
              <div className="w-11 h-11 rounded-lg bg-brand-cyan/10 flex items-center justify-center mb-4 text-brand-cyan group-hover:shadow-glow-cyan-sm transition-shadow duration-300">
                {f.icon}
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Stats */}
      <section id="stats" className="max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
          className="grid grid-cols-2 md:grid-cols-4 gap-5"
        >
          {[
            { value: "17+", label: "Regex Categories", color: "orange" },
            { value: "97%", label: "ML Model Accuracy", color: "cyan" },
            { value: "10+", label: "Code Vuln Rules", color: "orange" },
            { value: "3-Layer", label: "Analysis Pipeline", color: "cyan" },
          ].map((s, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              custom={i}
              className="text-center p-6 rounded-xl bg-brand-card border border-white/5"
            >
              <div className={`text-3xl font-extrabold font-poppins ${s.color === "orange" ? "text-brand-orange" : "text-brand-cyan"}`}>
                {s.value}
              </div>
              <div className="text-xs text-gray-500 mt-2 font-medium tracking-wide uppercase">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Dashboard Preview */}
      <section id="security" className="max-w-5xl mx-auto px-6 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="text-center mb-12"
        >
          <motion.h2
            variants={fadeUp}
            className="text-section-sm md:text-section font-poppins font-bold mb-4"
          >
            Real-Time <span className="text-brand-orange">Intelligence</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-gray-500 max-w-xl mx-auto">
            Monitor every prompt, scan, and vulnerability from a single dashboard.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="rounded-2xl border border-white/5 bg-brand-card p-1 shadow-glow-orange-lg"
        >
          <div className="rounded-xl bg-brand-dark p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <span className="text-[11px] text-gray-600 font-mono">guardion.security/dashboard</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Prompts", val: "2,847", c: "text-brand-cyan" },
                { label: "Blocked", val: "312", c: "text-red-400" },
                { label: "Repos", val: "89", c: "text-brand-orange" },
                { label: "Score", val: "94/100", c: "text-emerald-400" },
              ].map((m, i) => (
                <div key={i} className="bg-brand-card rounded-lg p-3 border border-white/5">
                  <div className={`text-lg font-bold ${m.c}`}>{m.val}</div>
                  <div className="text-[10px] text-gray-600 mt-0.5">{m.label}</div>
                </div>
              ))}
            </div>
            <div className="flex items-end gap-1.5 h-20 pt-2">
              {[35, 55, 42, 70, 60, 85, 50, 75, 90, 65, 80, 45].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-gradient-to-t from-brand-orange/60 to-brand-cyan/40"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-orange/5 via-transparent to-brand-cyan/5 rounded-3xl pointer-events-none" />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="relative z-10"
        >
          <motion.h2
            variants={fadeUp}
            className="text-section-sm md:text-section font-poppins font-bold mb-4"
          >
            Ready to Secure Your Workflow?
          </motion.h2>
          <motion.p variants={fadeUp} className="text-gray-500 mb-8">
            Sign up in seconds. No credit card required.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link
              to="/signup"
              className="inline-block px-10 py-4 bg-brand-orange hover:bg-brand-orange-light text-lg font-semibold rounded-xl transition-all duration-300 shadow-glow-orange hover:shadow-glow-orange-lg hover:scale-105"
            >
              Create Your Account
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 text-center py-8 text-gray-600 text-xs">
        <span className="text-brand-orange font-semibold">Guardion</span> v2.0 &middot; AI Prompt Security & Vulnerability Platform
      </footer>
    </div>
  );
}

const features = [
  {
    title: "Prompt Security Scanner",
    desc: "Detects API keys, passwords, PII, and 17+ sensitive data categories in AI prompts before they reach LLMs.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
  {
    title: "Repository Vulnerability Scan",
    desc: "Scans GitHub repos for dependency vulnerabilities via OSV API with Gemini-powered remediation suggestions.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    ),
  },
  {
    title: "Pre-Push Code Audit",
    desc: "Static analysis catches SQL injection, XSS, hardcoded secrets, and 10+ vulnerability patterns in source code.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
      </svg>
    ),
  },
  {
    title: "3-Stage ML Pipeline",
    desc: "Regex + sentence-transformers ML model (97% accuracy) + Gemini contextual analysis for maximum coverage.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
      </svg>
    ),
  },
  {
    title: "Chrome Extension",
    desc: "Real-time prompt interception on ChatGPT, Claude, and Gemini with automatic sanitization.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
  {
    title: "Admin Monitoring",
    desc: "Role-based dashboards with user management, threat analytics, and platform-wide security metrics.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
];
