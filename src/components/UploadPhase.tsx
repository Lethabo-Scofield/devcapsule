"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Github, UploadCloud, Terminal, Shield, Cpu, ArrowRight, Scan, GitBranch, Lock, Layers, Volume2, VolumeX } from "lucide-react";

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

        <div className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-10">
          <motion.div
            className="flex flex-col items-center gap-5"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-center leading-[1.1] text-gray-900">
              Understand your
              <br />
              <span className="text-indigo-500">codebase deeply</span>
            </h1>
          </motion.div>

          {/* ---- Tab Selector ---- */}
          <motion.div
            className="w-full max-w-sm"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            <div className="relative flex bg-gray-100 rounded-lg p-0.5 border border-gray-200">
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-md bg-white shadow-sm"
                style={{ left: activeTab === "repo" ? "2px" : "calc(50% + 2px)" }}
              />
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="relative z-10 flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2 text-gray-500 transition-colors hover:text-gray-900"
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* ---- Input Area ---- */}
          <AnimatePresence mode="wait">
            {activeTab === "repo" ? (
              <motion.div
                key="repo"
                className="w-full"
                variants={scaleFade}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3 shadow-sm focus-within:border-gray-400 transition-colors">
                  <Github className="text-gray-300 shrink-0 ml-1" size={20} />
                  <input
                    value={repoUrl}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setRepoUrl(e.target.value)}
                    placeholder="github.com/username/repo"
                    className="flex-1 bg-transparent outline-none text-sm sm:text-base text-gray-900 placeholder-gray-300"
                  />
                  <motion.button
                    onClick={() => performScan(repoUrl, null)}
                    disabled={!repoUrl}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="h-10 px-5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Analyze
                    <ArrowRight size={14} />
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="file"
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); setFile(e.dataTransfer.files[0]); }}
                className={`w-full rounded-xl p-10 text-center transition-all border ${dragging
                  ? "border-gray-400 bg-gray-50"
                  : "border-gray-200 border-dashed bg-white/80"
                  } shadow-sm`}
                variants={scaleFade}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <UploadCloud className="mx-auto mb-3 text-gray-300" size={32} />
                <p className="text-gray-600 text-sm font-medium">Drag and drop your archive</p>
                <p className="text-xs text-gray-400 mt-1">ZIP, TAR, or GZ</p>

                {file && (
                  <motion.div className="mt-3 text-sm text-gray-700 font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {file.name}
                  </motion.div>
                )}

                <motion.button
                  onClick={() => performScan("", file)}
                  disabled={!file}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="mt-5 h-10 px-5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium inline-flex items-center gap-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Analyze
                  <ArrowRight size={14} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ---- How It Works ---- */}
      <section className="relative py-32 px-6 bg-gray-50">
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

          {/* ---- Agent Diagram ---- */}
          <motion.div
            className="relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
            }}
          >
            {/* Central orchestrator node */}
            <motion.div
              className="flex flex-col items-center mb-8"
              variants={fadeUp}
            >
              <div className="w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center shadow-lg shadow-gray-900/10">
                <Cpu size={24} className="text-white" />
              </div>
              <p className="text-xs font-semibold text-gray-900 mt-3">Orchestrator</p>
              <p className="text-[11px] text-gray-400">Coordinates all agents</p>
            </motion.div>

            {/* Connecting lines (SVG) */}
            <div className="hidden sm:block absolute top-[88px] left-1/2 -translate-x-1/2 w-full max-w-lg h-16 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 500 60" fill="none" preserveAspectRatio="xMidYMid meet">
                <motion.path
                  d="M250 0 L80 55"
                  stroke="#d1d5db"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                />
                <motion.path
                  d="M250 0 L250 55"
                  stroke="#d1d5db"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
                <motion.path
                  d="M250 0 L420 55"
                  stroke="#d1d5db"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                />
              </svg>
            </div>

            {/* Agent cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:mt-16 mt-6">
              {agents.map((agent, i) => (
                <motion.div
                  key={i}
                  className="relative bg-white rounded-2xl border border-gray-200 p-6 text-center group hover:shadow-lg hover:shadow-gray-100 hover:border-gray-300 transition-all duration-300"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                  }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <motion.div
                    className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 mx-auto mb-4 group-hover:bg-gray-900 group-hover:text-white group-hover:border-gray-900 transition-all duration-300"
                  >
                    {agent.icon}
                  </motion.div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">{agent.name}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{agent.desc}</p>

                  {/* Pulse dot */}
                  <div className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-gray-200 group-hover:bg-emerald-400 transition-colors duration-300">
                    <div className="absolute inset-0 rounded-full bg-gray-200 group-hover:bg-emerald-400 group-hover:animate-ping transition-colors duration-300" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Flow arrow to output */}
            <motion.div
              className="flex flex-col items-center mt-10"
              variants={fadeUp}
            >
              <div className="w-px h-10 bg-gradient-to-b from-gray-200 to-gray-300" />
              <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                <ArrowRight size={14} className="text-gray-400 rotate-90" />
              </div>
              <div className="mt-3 px-5 py-2 rounded-full bg-white border border-gray-200 shadow-sm">
                <span className="text-xs font-medium text-gray-500">Full Security Report</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ---- Capabilities ---- */}
      <section className="relative py-32 px-6 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-20"
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
      <section className="relative py-32 px-6 bg-gray-50 border-t border-gray-100">
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
      <section className="relative py-32 px-6 bg-white border-t border-gray-100">
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
      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <img src="/favicon.ico" alt="Dev Capsule" className="w-6 h-6 rounded" />
                <span className="font-semibold text-gray-900 text-sm">Dev Capsule</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                Open-source, AI-powered code analysis. Understand your repository's architecture, security, and developer experience.
              </p>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-[0.15em] text-gray-900 font-semibold mb-4">Product</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#features" className="text-gray-400 hover:text-gray-600 transition-colors">Features</a></li>
                <li><a href="#demo" className="text-gray-400 hover:text-gray-600 transition-colors">Demo</a></li>
                <li>
                  <a href="https://github.com/Pineapplers-Lab/Dev-Time-Capsule" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors">
                    Source Code
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-[0.15em] text-gray-900 font-semibold mb-4">Connect</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="https://github.com/Pineapplers-Lab/Dev-Time-Capsule" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-2">
                    <Github size={14} />
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="https://www.linkedin.com/company/pineapple-labss/posts/?feedView=all" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-300 text-xs">
              &copy; {new Date().getFullYear()} Dev Capsule. Built by Pineapplers Lab.
            </p>
            <p className="text-gray-300 text-xs">
              Open source under MIT License
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
