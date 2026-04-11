"use client";

import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Github, UploadCloud, Terminal, Shield, Cpu, ArrowRight, Scan, GitBranch, Lock, Layers, Volume2, VolumeX, FileText } from "lucide-react";

interface DevCapsuleLandingProps {
  performScan: (repoUrl: string, file: File | null) => void;
}

type TabKey = "repo" | "file";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const scaleFade: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

function LiveAgentDiagram({ agents }: { agents: { icon: React.ReactNode; name: string; desc: string }[] }) {
  const CYCLE = 8000;
  const [step, setStep] = useState(-1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStep(0);
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % 6);
    }, CYCLE / 6);
    return () => clearInterval(interval);
  }, []);

  const agentColors = ["#6366f1", "#10b981", "#f59e0b"];
  const agentLabels = ["Analyzing architecture...", "Scanning vulnerabilities...", "Generating steps..."];

  return (
    <div className="relative flex flex-col items-center">
      {/* Orchestrator */}
      <motion.div
        className="flex flex-col items-center mb-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center shadow-lg"
          animate={step === 0 ? { scale: [1, 1.08, 1], boxShadow: ["0 0 0 0 rgba(99,102,241,0)", "0 0 20px 6px rgba(99,102,241,0.3)", "0 0 0 0 rgba(99,102,241,0)"] } : {}}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <Cpu size={24} className="text-white" />
        </motion.div>
        <p className="text-xs font-semibold text-gray-900 mt-3">Capsule Orchestrator</p>
        <AnimatePresence mode="wait">
          <motion.p
            key={step === 0 ? "dispatch" : "idle"}
            className="text-[11px] text-gray-400 h-4"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
          >
            {step === 0 ? "Dispatching tasks..." : "Coordinating agents"}
          </motion.p>
        </AnimatePresence>
      </motion.div>

      {/* SVG lines + data particles */}
      <div className="hidden sm:block w-full max-w-lg h-16 pointer-events-none relative">
        <svg className="w-full h-full" viewBox="0 0 500 60" fill="none" preserveAspectRatio="xMidYMid meet">
          {[
            { path: "M250 0 L80 55", idx: 0, ex: 80, ey: 55 },
            { path: "M250 0 L250 55", idx: 1, ex: 250, ey: 55 },
            { path: "M250 0 L420 55", idx: 2, ex: 420, ey: 55 },
          ].map(({ path, idx, ex, ey }) => (
            <g key={idx}>
              <path d={path} stroke="#e5e7eb" strokeWidth="1.5" />
              {mounted && (
                <>
                  <motion.circle
                    r="4"
                    fill={agentColors[idx]}
                    initial={{ cx: 250, cy: 0, opacity: 0 }}
                    animate={
                      step === idx + 1
                        ? { cx: [250, ex], cy: [0, ey], opacity: [0, 1, 1, 0] }
                        : { cx: 250, cy: 0, opacity: 0 }
                    }
                    transition={step === idx + 1 ? { duration: 1, ease: "easeInOut" } : { duration: 0.15 }}
                  />
                  <motion.circle
                    r="3"
                    fill={agentColors[idx]}
                    initial={{ cx: 250, cy: 0, opacity: 0 }}
                    animate={
                      step === idx + 1
                        ? { cx: [250, ex], cy: [0, ey], opacity: [0, 0.6, 0.6, 0] }
                        : { cx: 250, cy: 0, opacity: 0 }
                    }
                    transition={step === idx + 1 ? { duration: 1, ease: "easeInOut", delay: 0.15 } : { duration: 0.15 }}
                  />
                </>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Agent cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:mt-0 mt-4 w-full">
        {agents.map((agent, i) => {
          const isActive = step === i + 1;
          const isDone = step > i + 1;
          return (
            <motion.div
              key={i}
              className="relative bg-white rounded-2xl border p-6 text-center transition-all duration-500"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{
                borderColor: isActive ? agentColors[i] : isDone ? "#d1d5db" : "#e5e7eb",
                boxShadow: isActive ? `0 0 24px -4px ${agentColors[i]}33` : "none",
              }}
            >
              <motion.div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 transition-all duration-500"
                style={{
                  backgroundColor: isActive ? agentColors[i] : isDone ? "#111827" : "#f9fafb",
                  color: isActive || isDone ? "#ffffff" : "#6b7280",
                  borderWidth: 1,
                  borderColor: isActive ? agentColors[i] : isDone ? "#111827" : "#f3f4f6",
                }}
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={isActive ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" } : {}}
              >
                {agent.icon}
              </motion.div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{agent.name}</h3>

              <AnimatePresence mode="wait">
                {isActive ? (
                  <motion.div
                    key="thinking"
                    className="flex items-center justify-center gap-2 h-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-xs font-medium" style={{ color: agentColors[i] }}>
                      {agentLabels[i]}
                    </span>
                    <span className="flex gap-0.5">
                      {[0, 1, 2].map((d) => (
                        <motion.span
                          key={d}
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: agentColors[i] }}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: d * 0.2 }}
                        />
                      ))}
                    </span>
                  </motion.div>
                ) : isDone ? (
                  <motion.p
                    key="done"
                    className="text-xs text-emerald-500 font-medium h-5 flex items-center justify-center gap-1"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, type: "spring" }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Complete
                  </motion.p>
                ) : (
                  <motion.p key="idle" className="text-gray-400 text-xs h-5 flex items-center justify-center">
                    Waiting...
                  </motion.p>
                )}
              </AnimatePresence>

            </motion.div>
          );
        })}
      </div>

      {/* Flow to report */}
      <div className="flex flex-col items-center mt-8">
        <motion.div
          className="w-px h-10 origin-top"
          style={{ background: step >= 4 ? "linear-gradient(to bottom, #d1d5db, #6366f1)" : "linear-gradient(to bottom, #e5e7eb, #d1d5db)" }}
          animate={step >= 4 ? { scaleY: [0, 1] } : {}}
          transition={{ duration: 0.5 }}
        />

        {/* Converging particles */}
        {step === 4 && (
          <>
            {agentColors.map((color, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
                initial={{
                  x: i === 0 ? -120 : i === 2 ? 120 : 0,
                  y: 0,
                  opacity: 0,
                }}
                animate={{ x: 0, y: 40, opacity: [0, 1, 1, 0] }}
                transition={{ duration: 0.8, delay: i * 0.12, ease: "easeInOut" }}
              />
            ))}
          </>
        )}

        {/* Report icon */}
        <motion.div
          className="flex flex-col items-center"
          animate={
            step >= 5
              ? { scale: 1, opacity: 1 }
              : { opacity: step >= 4 ? 0.4 : 0.2, scale: 0.95 }
          }
          transition={step >= 5 ? { duration: 0.5, ease: "easeOut" } : { duration: 0.3 }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500"
            style={{
              backgroundColor: step >= 5 ? "#6366f1" : "#f3f4f6",
              color: step >= 5 ? "#ffffff" : "#9ca3af",
              boxShadow: step >= 5 ? "0 0 30px -4px rgba(99,102,241,0.4)" : "none",
            }}
          >
            <FileText size={22} />
          </div>
          <AnimatePresence mode="wait">
            {step >= 5 ? (
              <motion.div
                key="ready"
                className="mt-3 px-5 py-2 rounded-full bg-indigo-50 border border-indigo-200"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <span className="text-xs font-semibold text-indigo-600">Report Ready</span>
              </motion.div>
            ) : (
              <motion.div
                key="pending"
                className="mt-3 px-5 py-2 rounded-full bg-white border border-gray-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="text-xs font-medium text-gray-400">Full Report</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

export default function DevCapsuleLanding({ performScan }: DevCapsuleLandingProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("repo");
  const [repoUrl, setRepoUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  const tabs: { key: TabKey; icon: React.ReactNode; label: string }[] = [
    { key: "repo", icon: <Github size={14} />, label: "Repository" },
    { key: "file", icon: <UploadCloud size={14} />, label: "Upload" },
  ];

  const agents = [
    {
      icon: <Layers size={20} />,
      name: "Architect Agent",
      desc: "Maps your project structure, identifies the tech stack, and documents component relationships.",
    },
    {
      icon: <Shield size={20} />,
      name: "Security Agent",
      desc: "Cross-references dependencies against OSV.dev and GitHub Advisory databases for known vulnerabilities.",
    },
    {
      icon: <Terminal size={20} />,
      name: "DX Agent",
      desc: "Generates onboarding guides and CLI remediation commands for every issue found.",
    },
  ];

  return (
    <div className="font-sans text-gray-900 bg-white overflow-x-hidden scroll-smooth">

      {/* ---- Hero ---- */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/hero-bg.png" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-white/60" />
        </div>

        <div className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-6 sm:gap-10 pt-16 sm:pt-0">
          <motion.div
            className="flex flex-col items-center gap-5"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-3xl sm:text-6xl font-bold tracking-tight text-center leading-[1.1] text-gray-900">
              Understand your
              <br />
              <span className="text-indigo-500">codebase deeply</span>
            </h1>
          </motion.div>

          {/* ---- Prompt Card ---- */}
          <motion.div
            className="w-full max-w-xl"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            <div className="relative bg-white/70 backdrop-blur-2xl rounded-2xl border border-white/80 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)] p-2">
              {/* Tab pills inside card */}
              <div className="flex gap-1 mb-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className="relative px-4 py-2 text-xs font-medium flex items-center gap-1.5 rounded-lg transition-all duration-200"
                  >
                    {activeTab === tab.key && (
                      <motion.div
                        layoutId="activeTabBg"
                        className="absolute inset-0 bg-gray-900 rounded-lg"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}
                    <span className={`relative z-10 transition-colors duration-200 ${activeTab === tab.key ? "text-white" : "text-gray-400 hover:text-gray-600"}`}>
                      {tab.icon}
                    </span>
                    <span className={`relative z-10 transition-colors duration-200 ${activeTab === tab.key ? "text-white" : "text-gray-400 hover:text-gray-600"}`}>
                      {tab.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Input area */}
              <AnimatePresence mode="wait">
                {activeTab === "repo" ? (
                  <motion.div
                    key="repo"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="relative group">
                      <div className="flex items-center bg-white rounded-xl border border-gray-200/80 overflow-hidden transition-all duration-300 group-focus-within:border-indigo-300 group-focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.08)]">
                        <div className="pl-4 pr-2 py-3.5">
                          <Github className="text-gray-300 group-focus-within:text-indigo-400 transition-colors duration-200" size={18} />
                        </div>
                        <input
                          value={repoUrl}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setRepoUrl(e.target.value)}
                          placeholder="Paste a GitHub URL..."
                          className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-300 py-3.5 pr-2"
                          onKeyDown={(e) => e.key === "Enter" && repoUrl && performScan(repoUrl, null)}
                        />
                        <div className="pr-2">
                          <motion.button
                            onClick={() => performScan(repoUrl, null)}
                            disabled={!repoUrl}
                            whileTap={{ scale: 0.94 }}
                            className="h-9 w-9 rounded-lg bg-gray-900 hover:bg-indigo-600 text-white flex items-center justify-center transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-gray-900"
                          >
                            <ArrowRight size={16} />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-300 text-center mt-2.5 tracking-wide">
                      Press Enter or click the arrow to start analysis
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="file"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setDragging(false); setFile(e.dataTransfer.files[0]); }}
                  >
                    <div className={`relative rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
                      dragging
                        ? "border-indigo-400 bg-indigo-50/50"
                        : file
                        ? "border-emerald-300 bg-emerald-50/30"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                    }`}>
                      <label className="flex flex-col items-center py-8 cursor-pointer">
                        <input
                          type="file"
                          accept=".zip,.tar,.gz,.tgz"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                        />
                        <motion.div
                          animate={dragging ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors duration-300 ${
                            file ? "bg-emerald-100 text-emerald-500" : "bg-gray-100 text-gray-400"
                          }`}>
                            <UploadCloud size={22} />
                          </div>
                        </motion.div>
                        {file ? (
                          <motion.div
                            className="text-center"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-emerald-500 mt-1">Ready to analyze</p>
                          </motion.div>
                        ) : (
                          <div className="text-center">
                            <p className="text-sm text-gray-500">
                              <span className="font-medium text-gray-700">Click to browse</span> or drag & drop
                            </p>
                            <p className="text-xs text-gray-300 mt-1">ZIP, TAR, or GZ</p>
                          </div>
                        )}
                      </label>
                    </div>
                    {file && (
                      <motion.div
                        className="mt-2 flex justify-center"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <motion.button
                          onClick={() => performScan("", file)}
                          whileTap={{ scale: 0.96 }}
                          className="h-10 px-6 rounded-xl bg-gray-900 hover:bg-indigo-600 text-white text-sm font-medium inline-flex items-center gap-2 transition-all duration-200"
                        >
                          Analyze
                          <ArrowRight size={14} />
                        </motion.button>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---- How It Works ---- */}
      <section className="relative py-16 sm:py-32 px-4 sm:px-6 bg-gray-50">
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-20"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-medium mb-4">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
              Three agents, one command
            </h2>
          </motion.div>

          {/* ---- Live Agent Diagram ---- */}
          <LiveAgentDiagram agents={agents} />
        </div>
      </section>

      {/* ---- Capabilities ---- */}
      <section className="relative py-16 sm:py-32 px-4 sm:px-6 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-10 sm:mb-20"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-medium mb-4">Capabilities</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
              Built for security-conscious teams
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-gray-100 rounded-2xl overflow-hidden">
            {[
              {
                icon: <Scan size={20} />,
                title: "Vulnerability Detection",
                desc: "Cross-references every dependency against OSV.dev and GitHub Advisory for known CVEs.",
              },
              {
                icon: <GitBranch size={20} />,
                title: "Architecture Mapping",
                desc: "Automatically maps your project structure, component tiers, and dependency graph.",
              },
              {
                icon: <Lock size={20} />,
                title: "Fix Commands",
                desc: "Generates copy-paste CLI commands to remediate every vulnerability found.",
              },
              {
                icon: <Cpu size={20} />,
                title: "Gemini-Powered",
                desc: "Uses Google's Gemini 2.5 Flash for fast, accurate multi-agent analysis.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="bg-white p-8 group"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 mb-4 group-hover:border-gray-300 transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Demo Video ---- */}
      <section className="relative py-16 sm:py-32 px-4 sm:px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-medium mb-4">See It In Action</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
              From URL to full report
            </h2>
          </motion.div>

          <motion.div
            className="relative rounded-xl overflow-hidden border border-gray-200 shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <video
              ref={videoRef}
              className="w-full"
              src="/HowItWorks.mp4"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              preload="auto"
            />
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-md text-xs border border-gray-200 flex items-center gap-2 shadow-sm">
              <div className="w-1.5 h-1.5 bg-gray-800 rounded-full animate-pulse" />
              <span className="text-gray-500">Live Demo</span>
            </div>
            <button
              onClick={() => {
                setIsMuted(!isMuted);
                if (videoRef.current) videoRef.current.muted = !isMuted;
              }}
              className="absolute bottom-3 right-3 w-9 h-9 rounded-lg bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-white shadow-sm transition-all duration-200"
              aria-label={isMuted ? "Unmute video" : "Mute video"}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </motion.div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="relative py-16 sm:py-32 px-4 sm:px-6 bg-white border-t border-gray-100">
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-4">
              Open source, always free
            </h2>
            <p className="text-gray-400 text-base mb-10 max-w-md mx-auto leading-relaxed">
              Dev Capsule is built in the open. Explore the source, contribute, or just give it a star.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            <a
              href="https://github.com/Pineapplers-Lab/Dev-Time-Capsule"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium transition-colors"
            >
              <Github size={16} />
              View on GitHub
            </a>
            <a
              href="https://github.com/Pineapplers-Lab/Dev-Time-Capsule?tab=contributing-ov-file"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-lg border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
            >
              Contribute
            </a>
          </motion.div>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="bg-[#0f172a]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-14">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <img src="/favicon.ico" alt="Dev Capsule" className="w-6 h-6 rounded" />
                <span className="font-semibold text-white text-sm">Dev Capsule</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                Open-source, AI-powered code analysis. Understand your repository's architecture, security, and developer experience.
              </p>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-[0.15em] text-slate-300 font-semibold mb-4">Product</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#demo" className="text-slate-400 hover:text-white transition-colors">Demo</a></li>
                <li>
                  <a href="https://github.com/Pineapplers-Lab/Dev-Time-Capsule" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                    Source Code
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-[0.15em] text-slate-300 font-semibold mb-4">Connect</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="https://github.com/Pineapplers-Lab/Dev-Time-Capsule" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                    <Github size={14} />
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="https://www.linkedin.com/company/pineapple-labss/posts/?feedView=all" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-slate-500 text-xs">
              &copy; {new Date().getFullYear()} Dev Capsule. Built by Pineapplers Lab.
            </p>
            <p className="text-slate-500 text-xs">
              Open source under MIT License
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
