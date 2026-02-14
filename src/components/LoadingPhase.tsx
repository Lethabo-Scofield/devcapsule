"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AGENTS } from "@/agents/agents";

type Props = {
    activeAgentIdx: number;
    logsFromBackend?: string[]; // Optional: can push backend logs dynamically
};

export default function LoadingPhase({ activeAgentIdx, logsFromBackend }: Props) {
    const [logs, setLogs] = useState<string[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    const agent = AGENTS[activeAgentIdx];

    // Add log for current agent whenever it changes
    useEffect(() => {
        if (!agent) return;

        const message = `>> ${agent.name}: querying ${agent.desc.toLowerCase()}...`;
        setLogs((prev) => [...prev, message]);

        const timer = setTimeout(() => {
            containerRef.current?.scrollTo({
                top: containerRef.current.scrollHeight,
                behavior: "smooth",
            });
        }, 50);

        return () => clearTimeout(timer);
    }, [agent]);

    // Append any backend logs dynamically
    useEffect(() => {
        if (!logsFromBackend?.length) return;
        setLogs((prev) => [...prev, ...logsFromBackend]);

        const timer = setTimeout(() => {
            containerRef.current?.scrollTo({
                top: containerRef.current.scrollHeight,
                behavior: "smooth",
            });
        }, 50);

        return () => clearTimeout(timer);
    }, [logsFromBackend]);

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-white/95 backdrop-blur-xl z-[100] flex items-center justify-center p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-full max-w-xl flex flex-col items-start space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                        Audit in Progress
                    </h2>

                    <div
                        ref={containerRef}
                        className="w-full h-80 overflow-y-auto bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-mono text-gray-700 space-y-2"
                    >
                        {logs.map((log, i) => (
                            <motion.div
                                key={`${i}-${log}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-center justify-between"
                            >
                                <span>{log}</span>
                                {i === logs.length - 1 && (
                                    <motion.span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
                                )}
                            </motion.div>
                        ))}
                    </div>

                    <div className="text-gray-500 text-sm mt-2">
                        {agent
                            ? `Currently processing: ${agent.name}`
                            : "Initializing agents..."}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
