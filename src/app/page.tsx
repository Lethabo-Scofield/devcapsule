"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Navigation from "@/components/Navigation";
import UploadPhase from "@/components/UploadPhase";
import LoadingPhase from "@/components/LoadingPhase";
import ResultsPhase from "@/components/ResultsPhase";
import { AGENTS } from "@/agents/agents";

type Phase = "upload" | "loading" | "results";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("upload");
  const [activeTab, setActiveTab] = useState("overview");
  const [scanResults, setScanResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeAgentIdx, setActiveAgentIdx] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const performScan = async (url: string, file: File | null = null) => {
    setError(null);
    setPhase("loading");
    setActiveAgentIdx(0);

    const timer = setInterval(() => {
      setActiveAgentIdx(v => (v < AGENTS.length - 1 ? v + 1 : v));
    }, 2500);

    try {
      const body = file ? { fileName: file.name } : { repoUrl: url };
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.metadata || !data?.agents_reports) {
        throw new Error("Invalid response from scan");
      }

      setScanResults(data);
      setPhase("results");
    } catch (e) {
      console.error("Frontend orchestration error:", e);
      setError("Analysis failed. Multi-agent coordination interrupted.");
      setPhase("results");
    } finally {
      clearInterval(timer);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation
        phase={phase}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setPhase={setPhase}
      />

      <AnimatePresence mode="wait">
        {phase === "upload" && <UploadPhase performScan={performScan} />}
        {phase === "loading" && <LoadingPhase activeAgentIdx={activeAgentIdx} />}
        {phase === "results" && (
          <ResultsPhase
            activeTab={activeTab}
            scanResults={scanResults}
            copiedId={copiedId}
            setCopiedId={setCopiedId}
          />
        )}
      </AnimatePresence>

      {error && <p className="text-red-500 text-center mt-6">{error}</p>}
    </div>
  );
}
