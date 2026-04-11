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
        <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-xl">
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
                        <span className="font-semibold text-sm tracking-tight text-gray-900">
                            Dev Capsule
                        </span>
                    </div>

                    {phase === "results" && (
                        <div className="hidden md:flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                            {["overview", "anatomy", "security"].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-5 py-1.5 rounded-md text-xs font-medium uppercase tracking-wider transition-all ${activeTab === tab
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-400 hover:text-gray-600"
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="hidden md:flex items-center gap-3 text-gray-300">
                        <a
                            href="https://github.com/Pineapplers-Lab/Dev-Time-Capsule"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-gray-600 transition-colors"
                        >
                            <Github size={16} />
                        </a>
                        <a
                            href="https://www.linkedin.com/company/pineapple-labss/posts/?feedView=all"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-gray-600 transition-colors"
                        >
                            <Linkedin size={16} />
                        </a>
                    </div>

                    {phase === "results" && (
                        <button
                            onClick={() => setOpen(!open)}
                            className="md:hidden text-gray-400"
                        >
                            <Menu size={20} />
                        </button>
                    )}
                </div>
            </div>

            {open && phase === "results" && (
                <div className="md:hidden border-t border-gray-100 bg-white">
                    <div className="flex flex-col gap-1 px-4 py-3">
                        {["overview", "anatomy", "security"].map(tab => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setActiveTab(tab);
                                    setOpen(false);
                                }}
                                className={`w-full rounded-lg px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${activeTab === tab
                                    ? "bg-gray-50 text-gray-900"
                                    : "text-gray-400"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}

                        <div className="flex gap-4 pt-3 border-t border-gray-100 mt-2">
                            <a
                                href="https://github.com/Pineapplers-Lab/Dev-Time-Capsule"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <Github size={16} />
                            </a>
                            <a
                                href="https://www.linkedin.com/company/pineapple-labss/posts/?feedView=all"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-gray-600"
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
