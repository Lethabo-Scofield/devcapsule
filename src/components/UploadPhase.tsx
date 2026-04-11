"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Github, UploadCloud, Terminal, Shield, Cpu, ArrowRight, Scan, GitBranch, Lock, Layers } from "lucide-react";

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
    <div className="font-sans text-neutral-100 bg-neutral-950 overflow-x-hidden">

      {/* ---- Hero ---- */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/hero-bg.png" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-neutral-950/75" />
        </div>

        <div className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-10">
          <motion.div
            className="flex flex-col items-center gap-5"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-800 bg-neutral-900/80 text-xs text-neutral-400 font-medium tracking-wide">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              AI-Powered Code Analysis
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-center leading-[1.1]">
              Understand your
              <br />
              <span className="bg-gradient-to-r from-indigo-400 to-indigo-300 bg-clip-text text-transparent">codebase deeply</span>
            </h1>

            <p className="text-neutral-500 text-base sm:text-lg text-center max-w-md leading-relaxed">
              Three AI agents analyze your repository's architecture, security, and developer experience — in seconds.
            </p>
          </motion.div>

          {/* ---- Tab Selector ---- */}
          <motion.div
            className="w-full max-w-sm"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            <div className="relative flex bg-neutral-900 rounded-lg p-0.5 border border-neutral-800">
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-md bg-neutral-800"
                style={{ left: activeTab === "repo" ? "2px" : "calc(50% + 2px)" }}
              />
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="relative z-10 flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2 text-neutral-400 transition-colors hover:text-neutral-200"
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
                <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-xl p-3 focus-within:border-indigo-500/50 transition-colors">
                  <Github className="text-neutral-600 shrink-0 ml-1" size={20} />
                  <input
                    value={repoUrl}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setRepoUrl(e.target.value)}
                    placeholder="github.com/username/repo"
                    className="flex-1 bg-transparent outline-none text-sm sm:text-base text-neutral-200 placeholder-neutral-600"
                  />
                  <motion.button
                    onClick={() => performScan(repoUrl, null)}
                    disabled={!repoUrl}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="h-10 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
                  ? "border-indigo-500/50 bg-indigo-500/5"
                  : "border-neutral-800 border-dashed bg-neutral-900/50"
                  }`}
                variants={scaleFade}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <UploadCloud className="mx-auto mb-3 text-neutral-600" size={32} />
                <p className="text-neutral-300 text-sm font-medium">Drag and drop your archive</p>
                <p className="text-xs text-neutral-600 mt-1">ZIP, TAR, or GZ</p>

                {file && (
                  <motion.div className="mt-3 text-sm text-indigo-400" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {file.name}
                  </motion.div>
                )}

                <motion.button
                  onClick={() => performScan("", file)}
                  disabled={!file}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="mt-5 h-10 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium inline-flex items-center gap-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
      <section className="relative py-32 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-950" />
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-neutral-800 to-transparent ml-[50%]" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div
            className="text-center mb-20"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-400 font-medium mb-4">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Three agents, one command
            </h2>
          </motion.div>

          <div className="space-y-16">
            {agents.map((agent, i) => (
              <motion.div
                key={i}
                className="flex gap-6 items-start"
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="shrink-0 w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-indigo-400">
                  {agent.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-200 mb-1">{agent.name}</h3>
                  <p className="text-neutral-500 text-sm leading-relaxed">{agent.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Capabilities ---- */}
      <section className="relative py-32 px-6 border-t border-neutral-900">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-20"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-400 font-medium mb-4">Capabilities</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Built for security-conscious teams
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-neutral-800/50 rounded-2xl overflow-hidden">
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
                className="bg-neutral-950 p-8 group"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-indigo-400 mb-4 group-hover:border-indigo-500/30 transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-base font-semibold text-neutral-200 mb-2">{item.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Demo Video ---- */}
      <section className="relative py-32 px-6 border-t border-neutral-900">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-400 font-medium mb-4">See It In Action</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              From URL to full report
            </h2>
          </motion.div>

          <motion.div
            className="relative rounded-xl overflow-hidden border border-neutral-800"
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
              muted
              playsInline
              preload="auto"
            />
            <div className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-sm px-3 py-1.5 rounded-md text-xs border border-neutral-800 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
              <span className="text-neutral-400">Live Demo</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="relative py-32 px-6 border-t border-neutral-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(99,102,241,0.05)_0%,_transparent_60%)]" />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Open source, always free
            </h2>
            <p className="text-neutral-500 text-base mb-10 max-w-md mx-auto leading-relaxed">
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
              className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
            >
              <Github size={16} />
              View on GitHub
            </a>
            <a
              href="https://github.com/Pineapplers-Lab/Dev-Time-Capsule?tab=contributing-ov-file"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-lg border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white text-sm font-medium transition-colors"
            >
              Contribute
            </a>
          </motion.div>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="border-t border-neutral-900 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-neutral-500 text-sm">
            <Terminal size={14} />
            <span>&copy; {new Date().getFullYear()} Dev Capsule</span>
          </div>
          <div className="flex items-center gap-5">
            <a
              href="https://github.com/Pineapplers-Lab/Dev-Time-Capsule"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-600 hover:text-neutral-400 transition-colors"
            >
              <Github size={16} />
            </a>
            <a
              href="https://www.linkedin.com/company/pineapple-labss/posts/?feedView=all"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-600 hover:text-neutral-400 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
