"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { Github, UploadCloud, Target, Users, Star, Terminal, Play, Pause } from "lucide-react";
import { useState, ChangeEvent, useRef } from "react";

interface DevCapsuleLandingProps {
  performScan: (repoUrl: string, file: File | null) => void;
  securityScore?: number;
}

type TabKey = "repo" | "file";

// --- Motion Variants ---
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const scaleFade: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
};

// --- Reusable Components ---
const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: JSX.Element;
  title: string;
  description: string;
}) => (
  <motion.div
    className="p-6 bg-gray-800 rounded-xl shadow hover:shadow-lg transition"
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    variants={fadeUp}
  >
    <div className="mx-auto mb-3">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-300 text-sm">{description}</p>
  </motion.div>
);

const CTAButton = ({
  href,
  children,
  primary = true,
}: {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
}) => (
  <a
    href={href}
    target="_blank"
    className={`flex items-center gap-2 font-semibold px-8 py-4 rounded-lg shadow-lg transition ${primary
        ? "bg-blue-500 text-white hover:shadow-xl"
        : "border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
      }`}
  >
    {children}
  </a>
);

export default function DevCapsuleLanding({ performScan, securityScore }: DevCapsuleLandingProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("repo");
  const [repoUrl, setRepoUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);

  // Video state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const tabs: { key: TabKey; icon: JSX.Element; label: string }[] = [
    { key: "repo", icon: <Github size={16} />, label: "Repo" },
    { key: "file", icon: <UploadCloud size={16} />, label: "Upload" },
  ];

  return (
    <div className="font-sans text-gray-100 bg-gray-900">
      {/* -------------------- Hero / Upload -------------------- */}
      <motion.div
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6"
        style={{
          backgroundImage: "url(/image.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-8 sm:gap-12">
          <motion.h1
            className="text-3xl sm:text-5xl font-semibold tracking-tight text-white text-center"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            Upload Your <span className="text-blue-400">Codebase</span>
          </motion.h1>

          {/* --- Tab Selector --- */}
          <div className="relative flex bg-white/20 backdrop-blur-xl rounded-full p-1 shadow-lg w-full max-w-xs sm:max-w-sm">
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="absolute top-1 bottom-1 w-1/2 rounded-full bg-white/30 shadow"
              style={{ left: activeTab === "repo" ? "4px" : "50%" }}
            />
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="relative z-10 flex-1 py-2 text-sm font-semibold flex items-center justify-center gap-2"
                aria-label={`Switch to ${tab.label} tab`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* --- Upload Area --- */}
          <AnimatePresence mode="wait">
            {activeTab === "repo" ? (
              <motion.div
                key="repo"
                className="w-full max-w-2xl bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl flex items-center gap-4"
                variants={scaleFade}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <Github className="text-gray-300 shrink-0" />
                <input
                  value={repoUrl}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setRepoUrl(e.target.value)}
                  placeholder="github.com/username/repo"
                  className="flex-1 bg-transparent outline-none text-base sm:text-lg text-white placeholder-gray-400"
                />
                <motion.button
                  onClick={() => performScan(repoUrl, null)}
                  disabled={!repoUrl}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg disabled:opacity-40"
                  aria-label="Analyze repository"
                >
                  <UploadCloud size={18} />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="file"
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  setFile(e.dataTransfer.files[0]);
                }}
                className={`w-full max-w-2xl rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center transition-all border-2 border-dashed ${
                  dragging ? "border-blue-400 bg-blue-400/10 scale-[1.02]" : "border-white/30 bg-white/5"
                }`}
                variants={scaleFade}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <UploadCloud className="mx-auto mb-3 sm:mb-4 text-white" size={36} />
                <p className="text-white text-base sm:text-lg font-medium">Drag and drop your archive</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">ZIP, TAR, or GZ supported</p>

                {file && (
                  <motion.div className="mt-3 text-sm text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {file.name}
                  </motion.div>
                )}

                <motion.button
                  onClick={() => performScan("", file)}
                  disabled={!file}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-5 h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg mx-auto disabled:opacity-40"
                  aria-label="Analyze file"
                >
                  <UploadCloud size={18} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- Security Score --- */}
          {securityScore !== undefined && (
            <motion.div
              className="w-full max-w-2xl bg-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-lg flex items-center gap-3 sm:gap-4"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <Target className="text-blue-400" />
              <div className="flex-1">
                <div className="text-xs uppercase tracking-widest text-gray-400">Health Score</div>
                <div className="text-xl sm:text-2xl font-semibold text-white">{securityScore}%</div>
                <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-blue-400" initial={{ width: 0 }} animate={{ width: `${securityScore}%` }} />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* -------------------- Features Section -------------------- */}
      <section className="py-20 px-6 text-center bg-gray-900">
        <motion.h2
          className="text-4xl font-bold mb-12"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          Why Developers Love Dev Capsule
        </motion.h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <FeatureCard icon={<Star className="mx-auto mb-3 text-yellow-400" size={32} />} title="Open-source & Free" description="Completely free for everyone to use and contribute." />
          <FeatureCard icon={<Terminal className="mx-auto mb-3 text-blue-400" size={32} />} title="Lightweight Setup" description="Run in minutes with minimal dependencies." />
          <FeatureCard icon={<Users className="mx-auto mb-3 text-green-400" size={32} />} title="Collaborative" description="Track tasks and team progress seamlessly." />
          <FeatureCard icon={<Github className="mx-auto mb-3 text-purple-400" size={32} />} title="Extensible" description="Plugin-friendly and API-ready for integrations." />
        </div>
      </section>

      {/* -------------------- Visuals / Demo -------------------- */}
      <section className="py-20 px-6 text-center bg-gray-800">
        <motion.h2
          className="text-4xl font-bold mb-6"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          See It In Action
        </motion.h2>
        <p className="max-w-3xl mx-auto mb-12 text-gray-300">Check how tasks and dashboards come alive in Dev Capsule.</p>

        <motion.div
          className="relative max-w-4xl mx-auto rounded-lg shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <video
            ref={videoRef}
            className="w-full rounded-lg"
            src="/HowItWorks.mp4"
            poster="/howitworks-poster.png"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          />
          <button
            onClick={togglePlay}
            className="absolute bottom-4 right-4 bg-black/50 text-white p-3 rounded-full shadow hover:bg-black/70 transition"
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
        </motion.div>
      </section>

      {/* -------------------- Community / CTA -------------------- */}
      <section className="py-20 px-6 text-center bg-gray-800">
        <motion.h2
          className="text-4xl font-bold mb-6"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          Join the Dev Capsule Community
        </motion.h2>
        <p className="max-w-2xl mx-auto mb-12 text-lg text-gray-300">
          Explore the open-source code, contribute, and collaborate with developers worldwide.
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <CTAButton href="https://github.com/devcapsule" primary>
            <Github size={20} /> View on GitHub
          </CTAButton>
          <CTAButton href="https://github.com/devcapsule/blob/main/CONTRIBUTING.md" primary={false}>
            <Users size={20} /> Contribute
          </CTAButton>
        </div>
        <div className="mt-12 flex flex-wrap justify-center gap-12 text-gray-400">
          <div className="flex items-center gap-2">
            <Star className="text-yellow-400" /> 3.2k Stars
          </div>
          <div className="flex items-center gap-2">
            <Users className="text-blue-400" /> 250 Contributors
          </div>
        </div>
      </section>

      {/* -------------------- Technical Details -------------------- */}
      <section className="py-20 px-6 text-center bg-gray-900">
        <motion.h2
          className="text-4xl font-bold mb-8"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          Technical Details
        </motion.h2>
        <p className="max-w-3xl mx-auto text-gray-400 mb-12">
          Built with Node.js & React, lightweight DB support, and fully extensible via APIs and plugins.
        </p>
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-8">
          <div className="p-6 bg-gray-800 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="font-semibold mb-2">Stack</h3>
            <p>Node.js, React, TailwindCSS</p>
          </div>
          <div className="p-6 bg-gray-800 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="font-semibold mb-2">DB</h3>
            <p>Lightweight JSON / SQLite support</p>
          </div>
          <div className="p-6 bg-gray-800 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="font-semibold mb-2">Deployment</h3>
            <p>Docker-ready, serverless compatible</p>
          </div>
        </div>
      </section>

      {/* -------------------- Footer -------------------- */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center flex flex-col gap-3">
        <div className="flex justify-center gap-6 flex-wrap">
          <a href="https://github.com/devcapsule" target="_blank" className="hover:text-white">
            GitHub
          </a>
          <a href="/docs" className="hover:text-white">
            Documentation
          </a>
          <a href="/license" className="hover:text-white">
            License
          </a>
          <a href="https://discord.gg/devcapsule" className="hover:text-white">
            Discord
          </a>
          <a href="https://twitter.com/devcapsule" className="hover:text-white">
            Twitter
          </a>
        </div>
        <p className="text-sm">&copy; {new Date().getFullYear()} Dev Capsule. All rights reserved.</p>
      </footer>
    </div>
  );
}
