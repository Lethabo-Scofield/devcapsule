"use client";

import Image from "next/image";
import { Github, Linkedin, Menu } from "lucide-react";
import { useState } from "react";

export default function Navigation({
    phase,
    activeTab,
    setActiveTab,
    setPhase
}: any) {
    const [open, setOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-14 items-center justify-between">
                    <div
                        className="flex items-center gap-2.5 cursor-pointer"
                        onClick={() => setPhase("upload")}
                    >
                        <Image
                            src="/favicon.ico"
                            alt="Dev Capsule"
                            width={28}
                            height={28}
                            className="rounded-lg"
                        />
                        <span className="font-semibold text-sm tracking-tight text-neutral-200">
                            Dev Capsule
                        </span>
                    </div>

                    {phase === "results" && (
                        <div className="hidden md:flex bg-neutral-900 p-0.5 rounded-lg border border-neutral-800">
                            {["overview", "anatomy", "security"].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-5 py-1.5 rounded-md text-xs font-medium uppercase tracking-wider transition-all ${activeTab === tab
                                        ? "bg-neutral-800 text-indigo-400"
                                        : "text-neutral-500 hover:text-neutral-300"
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="hidden md:flex items-center gap-3 text-neutral-600">
                        <a
                            href="https://github.com/Pineapplers-Lab/Dev-Time-Capsule"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-neutral-400 transition-colors"
                        >
                            <Github size={16} />
                        </a>
                        <a
                            href="https://www.linkedin.com/company/pineapple-labss/posts/?feedView=all"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-neutral-400 transition-colors"
                        >
                            <Linkedin size={16} />
                        </a>
                    </div>

                    {phase === "results" && (
                        <button
                            onClick={() => setOpen(!open)}
                            className="md:hidden text-neutral-500"
                        >
                            <Menu size={20} />
                        </button>
                    )}
                </div>
            </div>

            {open && phase === "results" && (
                <div className="md:hidden border-t border-neutral-800 bg-neutral-950">
                    <div className="flex flex-col gap-1 px-4 py-3">
                        {["overview", "anatomy", "security"].map(tab => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setActiveTab(tab);
                                    setOpen(false);
                                }}
                                className={`w-full rounded-lg px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${activeTab === tab
                                    ? "bg-neutral-900 text-indigo-400"
                                    : "text-neutral-500"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}

                        <div className="flex gap-4 pt-3 border-t border-neutral-800 mt-2">
                            <a
                                href="https://github.com/Pineapplers-Lab/Dev-Time-Capsule"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-neutral-500 hover:text-neutral-300"
                            >
                                <Github size={16} />
                            </a>
                            <a
                                href="https://www.linkedin.com/company/pineapple-labss/posts/?feedView=all"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-neutral-500 hover:text-neutral-300"
                            >
                                <Linkedin size={16} />
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
