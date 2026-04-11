"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type LogLine = {
    text: string;
    type: "system" | "agent" | "success" | "info" | "progress" | "warn";
    agent?: string;
};

type Props = {
    activeAgentIdx: number;
    repoUrl?: string;
};

const AGENT_LOGS: Record<string, LogLine[]> = {
    architect: [
        { text: "Spawning Architect agent...", type: "system" },
        { text: "[Architect] Initializing structural analysis pipeline", type: "agent", agent: "architect" },
        { text: "[Architect] Fetching repository file tree via GitHub API", type: "agent", agent: "architect" },
        { text: "[Architect] ████████████████████░░░░ 78% — Parsing file structure", type: "progress", agent: "architect" },
        { text: "[Architect] Detected package.json — extracting dependency graph", type: "info", agent: "architect" },
        { text: "[Architect] Mapping component tiers: Frontend / Backend / Infrastructure", type: "agent", agent: "architect" },
        { text: "[Architect] ██████████████████████████ 100% — Analysis complete", type: "progress", agent: "architect" },
        { text: "[Architect] Querying Gemini 2.5 Flash for architectural insights...", type: "agent", agent: "architect" },
        { text: "[Architect] ✓ Stack identified · Components mapped · Summary generated", type: "success", agent: "architect" },
    ],
    security: [
        { text: "Spawning Security Sentinel...", type: "system" },
        { text: "[Security] Initializing vulnerability scanner", type: "agent", agent: "security" },
        { text: "[Security] Extracting dependencies from package.json", type: "agent", agent: "security" },
        { text: "[Security] Resolving exact versions from lockfile", type: "info", agent: "security" },
        { text: "[Security] ████████░░░░░░░░░░░░░░░░ 32% — Querying OSV.dev batch API", type: "progress", agent: "security" },
        { text: "[Security] Scanning npm ecosystem — batch 1/2 dispatched", type: "agent", agent: "security" },
        { text: "[Security] ████████████████░░░░░░░░ 64% — Processing advisories", type: "progress", agent: "security" },
        { text: "[Security] Cross-referencing GHSA + CVE databases", type: "agent", agent: "security" },
        { text: "[Security] ██████████████████████████ 100% — Scan complete", type: "progress", agent: "security" },
        { text: "[Security] Querying Gemini 2.5 Flash for fix commands...", type: "agent", agent: "security" },
        { text: "[Security] ✓ Vulnerabilities cataloged · Fix commands generated", type: "success", agent: "security" },
    ],
    onboarding: [
        { text: "Spawning DX Specialist...", type: "system" },
        { text: "[DX] Initializing developer experience analysis", type: "agent", agent: "onboarding" },
        { text: "[DX] Ingesting architect report + security findings", type: "agent", agent: "onboarding" },
        { text: "[DX] ████████████░░░░░░░░░░░░ 48% — Building onboarding steps", type: "progress", agent: "onboarding" },
        { text: "[DX] Generating clone, install, and run commands", type: "info", agent: "onboarding" },
        { text: "[DX] Mapping remediation paths for flagged vulnerabilities", type: "agent", agent: "onboarding" },
        { text: "[DX] ██████████████████████████ 100% — Steps finalized", type: "progress", agent: "onboarding" },
        { text: "[DX] Querying Gemini 2.5 Flash for practical CLI commands...", type: "agent", agent: "onboarding" },
        { text: "[DX] ✓ Onboarding guide ready · Remediation paths mapped", type: "success", agent: "onboarding" },
    ],
};

const INIT_LOGS: LogLine[] = [
    { text: "$ devcapsule scan --analyze", type: "system" },
    { text: "", type: "system" },
    { text: "Dev Capsule v1.0 — Multi-Agent Repository Analyzer", type: "info" },
    { text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", type: "system" },
    { text: "", type: "system" },
    { text: "Initializing orchestrator...", type: "system" },
    { text: "Connecting to GitHub API...", type: "info" },
    { text: "Repository validated ✓", type: "success" },
    { text: "Fetching file tree... found files", type: "info" },
    { text: "Downloading package.json...", type: "info" },
    { text: "Downloading package-lock.json...", type: "info" },
    { text: "", type: "system" },
    { text: "┌─────────────────────────────────────────────┐", type: "system" },
    { text: "│  Launching 3 agents in parallel              │", type: "system" },
    { text: "│  Architect · Security Sentinel · DX          │", type: "system" },
    { text: "└─────────────────────────────────────────────┘", type: "system" },
    { text: "", type: "system" },
];

const AGENT_KEYS = ["architect", "security", "onboarding"] as const;
const AGENT_NAMES = ["Architectural Agent", "Security Sentinel", "DX Specialist"];
const AGENT_COLORS = ["text-blue-400", "text-red-400", "text-purple-400"];
const AGENT_DOT_COLORS = ["bg-blue-400", "bg-red-400", "bg-purple-400"];

export default function LoadingPhase({ activeAgentIdx, repoUrl }: Props) {
    const [lines, setLines] = useState<LogLine[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const [agentPhase, setAgentPhase] = useState(0);
    const [agentLogIdx, setAgentLogIdx] = useState<Record<string, number>>({
        architect: 0,
        security: 0,
        onboarding: 0,
    });
    const [initDone, setInitDone] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const startTime = useRef(Date.now());
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    useEffect(() => {
        const t = setInterval(() => {
            if (mountedRef.current) setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
        }, 1000);
        return () => clearInterval(t);
    }, []);

    const scrollToBottom = useCallback(() => {
        requestAnimationFrame(() => {
            containerRef.current?.scrollTo({
                top: containerRef.current.scrollHeight,
                behavior: "smooth",
            });
        });
    }, []);

    const addLine = useCallback((line: LogLine) => {
        if (!mountedRef.current) return;
        setLines(prev => [...prev, line]);
        scrollToBottom();
    }, [scrollToBottom]);

    useEffect(() => {
        if (initDone) return;
        let i = 0;
        const interval = setInterval(() => {
            if (!mountedRef.current) { clearInterval(interval); return; }
            if (i < INIT_LOGS.length) {
                addLine(INIT_LOGS[i]);
                i++;
            } else {
                clearInterval(interval);
                if (mountedRef.current) setInitDone(true);
            }
        }, 180);
        return () => clearInterval(interval);
    }, [initDone, addLine]);

    useEffect(() => {
        if (!initDone) return;

        const currentAgentKey = AGENT_KEYS[agentPhase];
        if (!currentAgentKey) return;

        const logs = AGENT_LOGS[currentAgentKey];
        const idx = agentLogIdx[currentAgentKey];

        if (idx >= logs.length) {
            const nextPhase = agentPhase + 1;
            if (nextPhase < AGENT_KEYS.length) {
                const t = setTimeout(() => {
                    if (!mountedRef.current) return;
                    addLine({ text: "", type: "system" });
                    setAgentPhase(nextPhase);
                }, 400);
                return () => clearTimeout(t);
            }
            return;
        }

        const delay = logs[idx].type === "progress" ? 600 : logs[idx].type === "success" ? 800 : logs[idx].text === "" ? 100 : 350;

        const timer = setTimeout(() => {
            if (!mountedRef.current) return;
            addLine(logs[idx]);
            setAgentLogIdx(prev => ({ ...prev, [currentAgentKey]: prev[currentAgentKey] + 1 }));
        }, delay);

        return () => clearTimeout(timer);
    }, [initDone, agentPhase, agentLogIdx, addLine]);

    const getLineColor = (line: LogLine) => {
        switch (line.type) {
            case "success": return "text-green-400";
            case "progress": return "text-cyan-400";
            case "info": return "text-gray-400";
            case "warn": return "text-yellow-400";
            case "agent":
                if (line.agent === "architect") return "text-blue-400";
                if (line.agent === "security") return "text-red-400";
                if (line.agent === "onboarding") return "text-purple-400";
                return "text-gray-300";
            default: return "text-gray-500";
        }
    };

    const getAgentStatus = (idx: number) => {
        const key = AGENT_KEYS[idx];
        const totalLogs = AGENT_LOGS[key].length;
        const currentIdx = agentLogIdx[key];

        if (agentPhase > idx || currentIdx >= totalLogs) return "done";
        if (agentPhase === idx && initDone) return "active";
        return "waiting";
    };

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, "0")}`;
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-[#0a0a0f] z-[100] flex items-center justify-center p-3 sm:p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                role="dialog"
                aria-modal="true"
                aria-label="Repository scan in progress"
            >
                <div className="w-full max-w-3xl flex flex-col h-full max-h-[640px] sm:max-h-[720px]">

                    <div className="flex items-center justify-between bg-[#16161e] rounded-t-xl border border-[#2a2a3a] border-b-0 px-4 py-2.5">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                            </div>
                            <span className="text-[11px] text-gray-500 font-mono ml-3">
                                devcapsule — scan
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[11px] text-gray-600 font-mono" aria-label={`Elapsed time: ${formatTime(elapsed)}`}>
                                {formatTime(elapsed)}
                            </span>
                            <div className="flex items-center gap-1">
                                <motion.div
                                    className="w-1.5 h-1.5 rounded-full bg-green-500 motion-reduce:animate-none"
                                    animate={{ opacity: [1, 0.3, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                />
                                <span className="text-[10px] text-green-500 font-mono">LIVE</span>
                            </div>
                        </div>
                    </div>

                    <div
                        ref={containerRef}
                        className="flex-1 bg-[#0d0d14] border-x border-[#2a2a3a] overflow-y-auto px-4 sm:px-5 py-4 font-mono text-[11px] sm:text-[12px] leading-[1.7] scrollbar-thin"
                        role="log"
                        aria-live="polite"
                        aria-label="Scan progress log"
                    >
                        {lines.map((line, i) => (
                            <div
                                key={i}
                                className={`${getLineColor(line)} whitespace-pre min-w-0 ${line.text === "" ? "h-3" : "animate-[fadeIn_0.15s_ease-out]"}`}
                            >
                                {line.text}
                            </div>
                        ))}

                        <span
                            className="inline-block w-[7px] h-[14px] bg-gray-400 ml-0.5 animate-[blink_1.2s_step-end_infinite] motion-reduce:hidden"
                        />
                    </div>

                    <div className="bg-[#16161e] rounded-b-xl border border-[#2a2a3a] border-t-[#2a2a3a] px-4 sm:px-5 py-3">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-4 sm:gap-6">
                                {AGENT_NAMES.map((name, i) => {
                                    const status = getAgentStatus(i);
                                    return (
                                        <div key={i} className="flex items-center gap-1.5 sm:gap-2">
                                            {status === "done" ? (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="w-2 h-2 rounded-full bg-green-500"
                                                />
                                            ) : status === "active" ? (
                                                <motion.div
                                                    className={`w-2 h-2 rounded-full ${AGENT_DOT_COLORS[i]} motion-reduce:animate-none`}
                                                    animate={{ opacity: [1, 0.3, 1] }}
                                                    transition={{ duration: 1, repeat: Infinity }}
                                                />
                                            ) : (
                                                <div className="w-2 h-2 rounded-full bg-gray-700" />
                                            )}
                                            <span className={`text-[10px] sm:text-[11px] font-mono ${
                                                status === "done" ? "text-green-500" :
                                                status === "active" ? AGENT_COLORS[i] :
                                                "text-gray-600"
                                            }`}>
                                                {name.split(" ")[0]}
                                                <span className="hidden sm:inline"> {name.split(" ").slice(1).join(" ")}</span>
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="w-full h-1 bg-[#1a1a2a] rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(
                            !initDone ? 8 :
                            agentPhase === 0 ? 8 + (agentLogIdx.architect / AGENT_LOGS.architect.length) * 28 :
                            agentPhase === 1 ? 36 + (agentLogIdx.security / AGENT_LOGS.security.length) * 28 :
                            agentPhase === 2 ? 64 + (agentLogIdx.onboarding / AGENT_LOGS.onboarding.length) * 28 :
                            92
                        )} aria-valuemin={0} aria-valuemax={100}>
                            <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full"
                                initial={{ width: "0%" }}
                                animate={{
                                    width: !initDone ? "8%" :
                                           agentPhase === 0 ? `${8 + (agentLogIdx.architect / AGENT_LOGS.architect.length) * 28}%` :
                                           agentPhase === 1 ? `${36 + (agentLogIdx.security / AGENT_LOGS.security.length) * 28}%` :
                                           agentPhase === 2 ? `${64 + (agentLogIdx.onboarding / AGENT_LOGS.onboarding.length) * 28}%` :
                                           "92%"
                                }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                </div>

                <style>{`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(3px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes blink {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0; }
                    }
                `}</style>
            </motion.div>
        </AnimatePresence>
    );
}
