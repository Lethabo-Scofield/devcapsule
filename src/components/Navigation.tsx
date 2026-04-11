"use client";

import Image from "next/image";
import { Github, Linkedin, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navigation({
    phase,
    activeTab,
    setActiveTab,
    setPhase
}: any) {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl transition-all duration-300 rounded-2xl ${scrolled
            ? "bg-white/90 backdrop-blur-xl shadow-lg shadow-black/[0.03] border border-gray-200/80"
            : "bg-white/60 backdrop-blur-md border border-gray-200/50"
            }`}>
            <div className="px-4 sm:px-5">
                <div className="flex h-12 items-center justify-between">
                    <div
                        className="flex items-center gap-2 cursor-pointer group"
                        onClick={() => setPhase("upload")}
                    >
                        <Image
                            src="/favicon.ico"
                            alt="Dev Capsule"
                            width={24}
                            height={24}
                            className="rounded-md group-hover:scale-110 transition-transform duration-200"
                        />
                        <span className="font-semibold text-sm tracking-tight text-gray-900">
                            Dev Capsule
                        </span>
                    </div>

                    {phase === "results" && (
                        <div className="hidden md:flex bg-gray-100/80 p-0.5 rounded-lg">
                            {["overview", "anatomy", "security"].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-1 rounded-md text-[11px] font-medium uppercase tracking-wider transition-all duration-200 ${activeTab === tab
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-400 hover:text-gray-600"
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-1">
                        <a
                            href="https://github.com/Pineapplers-Lab/Dev-Time-Capsule"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:flex w-8 h-8 items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100/80 transition-all duration-200"
                        >
                            <Github size={15} />
                        </a>
                        <a
                            href="https://www.linkedin.com/company/pineapple-labss/posts/?feedView=all"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:flex w-8 h-8 items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100/80 transition-all duration-200"
                        >
                            <Linkedin size={15} />
                        </a>

                        {phase === "results" && (
                            <button
                                onClick={() => setOpen(!open)}
                                className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100/80 transition-all duration-200"
                            >
                                {open ? <X size={16} /> : <Menu size={16} />}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {open && phase === "results" && (
                <div className="md:hidden border-t border-gray-100/80 px-3 pb-3 pt-2">
                    <div className="flex flex-col gap-0.5">
                        {["overview", "anatomy", "security"].map(tab => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setActiveTab(tab);
                                    setOpen(false);
                                }}
                                className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium uppercase tracking-wider transition-all duration-200 ${activeTab === tab
                                    ? "bg-gray-100/80 text-gray-900"
                                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-1 pt-2 mt-2 border-t border-gray-100/80">
                        <a
                            href="https://github.com/Pineapplers-Lab/Dev-Time-Capsule"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100/80 transition-all duration-200"
                        >
                            <Github size={15} />
                        </a>
                        <a
                            href="https://www.linkedin.com/company/pineapple-labss/posts/?feedView=all"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100/80 transition-all duration-200"
                        >
                            <Linkedin size={15} />
                        </a>
                    </div>
                </div>
            )}
        </nav>
    );
}
