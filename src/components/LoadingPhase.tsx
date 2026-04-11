"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type LogLine = {
    text: string;
    type: "system" | "agent" | "success" | "info" | "progress" | "warn" | "error";
    agent?: string;
};

type Props = {
    activeAgentIdx: number;
    repoUrl?: string;
    error?: string | null;
    onDismiss?: () => void;
};

const RANDOM_FAILURES: { trigger: string; lines: LogLine[] }[] = [
    {
        trigger: "architect",
        lines: [
            { text: "[Architect] ✗ GitHub API rate limit hit (403)", type: "error", agent: "architect" },
            { text: "[Architect] Backing off 1.2s... retrying with token rotation", type: "warn", agent: "architect" },
            { text: "[Architect] Retry successful — resuming pipeline", type: "success", agent: "architect" },
        ],
    },
    {
        trigger: "architect",
        lines: [
            { text: "[Architect] ✗ ETIMEDOUT fetching /contents/src — connection stalled", type: "error", agent: "architect" },
            { text: "[Architect] Switching to tree API fallback...", type: "warn", agent: "architect" },
            { text: "[Architect] Tree API responded 200 OK — recovered", type: "success", agent: "architect" },
        ],
    },
    {
        trigger: "security",
        lines: [
            { text: "[Security] ✗ OSV.dev batch query timeout (5000ms exceeded)", type: "error", agent: "security" },
            { text: "[Security] Splitting batch — retrying 12 packages in 2 smaller requests", type: "warn", agent: "security" },
            { text: "[Security] Both sub-batches returned 200 — scan recovered", type: "success", agent: "security" },
        ],
    },
    {
        trigger: "security",
        lines: [
            { text: "[Security] ✗ Malformed PURL for @types/node — skipping advisory lookup", type: "error", agent: "security" },
            { text: "[Security] Falling back to name+version query for 1 package", type: "warn", agent: "security" },
            { text: "[Security] Fallback query succeeded — no advisories missed", type: "success", agent: "security" },
        ],
    },
    {
        trigger: "security",
        lines: [
            { text: "[Security] ✗ ECONNRESET — OSV.dev connection dropped mid-response", type: "error", agent: "security" },
            { text: "[Security] Retrying with exponential backoff (attempt 2/3)...", type: "warn", agent: "security" },
            { text: "[Security] Reconnected — partial response merged with retry", type: "success", agent: "security" },
        ],
    },
    {
        trigger: "onboarding",
        lines: [
            { text: "[DX] ✗ Gemini 2.5 Flash returned 429 — quota temporarily exceeded", type: "error", agent: "onboarding" },
            { text: "[DX] Queuing retry with jittered delay (800ms)...", type: "warn", agent: "onboarding" },
            { text: "[DX] Gemini responded on retry — onboarding generation resumed", type: "success", agent: "onboarding" },
        ],
    },
    {
        trigger: "onboarding",
        lines: [
            { text: "[DX] ✗ JSON parse error in Gemini response — unexpected token at pos 847", type: "error", agent: "onboarding" },
            { text: "[DX] Attempting structured output repair with regex fallback...", type: "warn", agent: "onboarding" },
            { text: "[DX] Repaired — extracted 5 valid onboarding steps", type: "success", agent: "onboarding" },
        ],
    },
];

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

function pickRandomFailures(): Map<string, { afterIdx: number; lines: LogLine[] }> {
    const picked = new Map<string, { afterIdx: number; lines: LogLine[] }>();
    const agents = ["architect", "security", "onboarding"];

    for (const agent of agents) {
        if (Math.random() < 0.45) {
            const candidates = RANDOM_FAILURES.filter(f => f.trigger === agent);
            if (candidates.length > 0) {
                const failure = candidates[Math.floor(Math.random() * candidates.length)];
                const agentLogs = AGENT_LOGS[agent];
                const insertAfter = 2 + Math.floor(Math.random() * Math.max(1, agentLogs.length - 4));
                picked.set(agent, { afterIdx: insertAfter, lines: failure.lines });
            }
        }
    }

    return picked;
}

export default function LoadingPhase({ activeAgentIdx, repoUrl, error, onDismiss }: Props) {
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
    const [failureShown, setFailureShown] = useState<Record<string, boolean>>({});
    const [playingFailure, setPlayingFailure] = useState(false);
    const failurePlan = useRef(pickRandomFailures());
    const [realError, setRealError] = useState<string | null>(null);

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    useEffect(() => {
        if (error) setRealError(error);
    }, [error]);

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

    const addLines = useCallback((newLines: LogLine[], delayBetween: number, onComplete: () => void) => {
        let i = 0;
        const timers: ReturnType<typeof setTimeout>[] = [];
        const next = () => {
            if (!mountedRef.current || i >= newLines.length) {
                if (mountedRef.current) onComplete();
                return;
            }
            const line = newLines[i];
            i++;
            addLine(line);
            const d = line.type === "error" ? 900 : line.type === "warn" ? 700 : 500;
            timers.push(setTimeout(next, d));
        };
        timers.push(setTimeout(next, delayBetween));
        return () => timers.forEach(clearTimeout);
    }, [addLine]);

    useEffect(() => {
        if (initDone || realError) return;
        let i = 0;
        const interval = setInterval(() => {
            if (!mountedRef.current || realError) { clearInterval(interval); return; }
            if (i < INIT_LOGS.length) {
                addLine(INIT_LOGS[i]);
                i++;
            } else {
                clearInterval(interval);
                if (mountedRef.current) setInitDone(true);
            }
        }, 180);
        return () => clearInterval(interval);
    }, [initDone, addLine, realError]);

    useEffect(() => {
        if (!initDone || playingFailure || realError) return;

        const currentAgentKey = AGENT_KEYS[agentPhase];
        if (!currentAgentKey) return;

        const logs = AGENT_LOGS[currentAgentKey];
        const idx = agentLogIdx[currentAgentKey];

        const failInfo = failurePlan.current.get(currentAgentKey);
        if (failInfo && idx === failInfo.afterIdx && !failureShown[currentAgentKey]) {
            setPlayingFailure(true);
            const cleanup = addLines(failInfo.lines, 300, () => {
                if (!mountedRef.current) return;
                setFailureShown(prev => ({ ...prev, [currentAgentKey]: true }));
                setPlayingFailure(false);
            });
            return cleanup;
        }

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
    }, [initDone, agentPhase, agentLogIdx, addLine, addLines, playingFailure, failureShown, realError]);

    useEffect(() => {
        if (!realError) return;
        const errorLines: LogLine[] = [
            { text: "", type: "system" },
            { text: "┌─────────────────────────────────────────────┐", type: "error" },
            { text: "│  ✗ FATAL ERROR                               │", type: "error" },
            { text: "└─────────────────────────────────────────────┘", type: "error" },
            { text: "", type: "system" },
            { text: `Error: ${realError}`, type: "error" },
            { text: "", type: "system" },
            { text: "Scan aborted. Press the button below to return.", type: "warn" },
        ];

        const cleanup = addLines(errorLines, 200, () => {});
        return cleanup;
    }, [realError, addLines]);

    const getLineColor = (line: LogLine) => {
        switch (line.type) {
            case "success": return "text-green-400";
            case "progress": return "text-cyan-400";
            case "info": return "text-gray-400";
            case "warn": return "text-yellow-400";
            case "error": return "text-red-500";
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

        if (realError) {
            if (agentPhase > idx || currentIdx >= totalLogs) return "done";
            if (agentPhase === idx) return "error";
            return "waiting";
        }

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
                                {realError ? (
                                    <>
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        <span className="text-[10px] text-red-500 font-mono">FAIL</span>
                                    </>
                                ) : (
                                    <>
                                        <motion.div
                                            className="w-1.5 h-1.5 rounded-full bg-green-500 motion-reduce:animate-none"
                                            animate={{ opacity: [1, 0.3, 1] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        />
                                        <span className="text-[10px] text-green-500 font-mono">LIVE</span>
                                    </>
                                )}
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

                        {!realError && (
                            <span
                                className="inline-block w-[7px] h-[14px] bg-gray-400 ml-0.5 animate-[blink_1.2s_step-end_infinite] motion-reduce:hidden"
                            />
                        )}
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
                                            ) : status === "error" ? (
                                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                            ) : (
                                                <div className="w-2 h-2 rounded-full bg-gray-700" />
                                            )}
                                            <span className={`text-[10px] sm:text-[11px] font-mono ${
                                                status === "done" ? "text-green-500" :
                                                status === "active" ? AGENT_COLORS[i] :
                                                status === "error" ? "text-red-500" :
                                                "text-gray-600"
                                            }`}>
                                                {name.split(" ")[0]}
                                                <span className="hidden sm:inline"> {name.split(" ").slice(1).join(" ")}</span>
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {realError && onDismiss && (
                                <button
                                    onClick={onDismiss}
                                    className="text-[11px] font-mono bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-md px-3 py-1 transition-colors"
                                >
                                    ← Back
                                </button>
                            )}
                        </div>

                        <div className="w-full h-1 bg-[#1a1a2a] rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(
                            realError ? 0 :
                            !initDone ? 8 :
                            agentPhase === 0 ? 8 + (agentLogIdx.architect / AGENT_LOGS.architect.length) * 28 :
                            agentPhase === 1 ? 36 + (agentLogIdx.security / AGENT_LOGS.security.length) * 28 :
                            agentPhase === 2 ? 64 + (agentLogIdx.onboarding / AGENT_LOGS.onboarding.length) * 28 :
                            92
                        )} aria-valuemin={0} aria-valuemax={100}>
                            <motion.div
                                className={`h-full rounded-full ${realError ? "bg-red-500" : "bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"}`}
                                initial={{ width: "0%" }}
                                animate={{
                                    width: realError ? "0%" :
                                           !initDone ? "8%" :
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
