"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import { motion, AnimatePresence, Variants, useScroll, useTransform } from "framer-motion";
import { Github, UploadCloud, Target, Users, Star, Terminal, Play, Pause, Volume2, VolumeX, Zap, Shield, Gauge, Code2, Lock, FileSearch, TrendingUp, MessageSquare, BookOpen, ExternalLink, ChevronRight, Check } from "lucide-react";

interface DevCapsuleLandingProps {
  performScan: (repoUrl: string, file: File | null) => void;
  securityScore?: number;
}

type TabKey = "repo" | "file";

// --- Motion Variants ---
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const scaleFade: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// --- Reusable Components ---
const FeatureCard = ({
  icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}) => (
  <motion.div
    className="group relative p-6 bg-gradient-to-br from-gray-800/50 to-gray-800/30 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-700/50 hover:border-blue-500/50 backdrop-blur-sm overflow-hidden"
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-50px" }}
    variants={{
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay } },
    }}
    whileHover={{ y: -8, transition: { duration: 0.2 } }}
  >
    {/* Gradient overlay on hover */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300" />

    <div className="relative z-10">
      <div className="mb-4 inline-flex p-3 rounded-xl bg-gray-900/50 border border-gray-700/50 group-hover:border-blue-500/50 transition-colors duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-blue-400 transition-colors duration-300">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
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
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`group relative flex items-center gap-2 font-semibold px-8 py-4 rounded-xl shadow-lg transition-all duration-300 overflow-hidden ${primary
      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:shadow-blue-500/50 hover:shadow-2xl"
      : "border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white backdrop-blur-sm"
      }`}
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.98 }}
  >
    {primary && (
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
    )}
    <span className="relative z-10 flex items-center gap-2">
      {children}
      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
    </span>
  </motion.a>
);

const StatCard = ({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) => (
  <motion.div
    className="flex flex-col items-center gap-2 p-6 rounded-xl bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm"
    whileHover={{ scale: 1.05, borderColor: "rgba(59, 130, 246, 0.5)" }}
    transition={{ duration: 0.2 }}
  >
    <div className="text-blue-400">{icon}</div>
    <div className="text-3xl font-bold text-white">{value}</div>
    <div className="text-sm text-gray-400">{label}</div>
  </motion.div>
);

const TechBadge = ({ name, icon }: { name: string; icon?: React.ReactNode }) => (
  <motion.div
    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-sm text-gray-300 backdrop-blur-sm"
    whileHover={{ scale: 1.05, borderColor: "rgba(59, 130, 246, 0.5)", color: "rgba(255, 255, 255, 1)" }}
    transition={{ duration: 0.2 }}
  >
    {icon}
    {name}
  </motion.div>
);

export default function DevCapsuleLanding({ performScan, securityScore }: DevCapsuleLandingProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("repo");
  const [repoUrl, setRepoUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(false);

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

  // Scroll animations
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const tabs: { key: TabKey; icon: React.ReactNode; label: string }[] = [
    { key: "repo", icon: <Github size={16} />, label: "Repo" },
    { key: "file", icon: <UploadCloud size={16} />, label: "Upload" },
  ];

  const features = [
    {
      icon: <Star className="text-yellow-400" size={28} />,
      title: "Open-source & Free",
      description: "Completely free for everyone to use and contribute. Join our thriving community of developers.",
    },
    {
      icon: <Terminal className="text-blue-400" size={28} />,
      title: "Lightweight Setup",
      description: "Get started in minutes with minimal dependencies. No complex configuration required.",
    },
    {
      icon: <Users className="text-green-400" size={28} />,
      title: "Collaborative",
      description: "Track tasks and team progress seamlessly with real-time updates and notifications.",
    },
    {
      icon: <Github className="text-purple-400" size={28} />,
      title: "Extensible",
      description: "Plugin-friendly and API-ready for integrations. Build custom workflows that fit your needs.",
    },
    {
      icon: <Shield className="text-cyan-400" size={28} />,
      title: "Security First",
      description: "Built-in security scanning and vulnerability detection to keep your code safe.",
    },
    {
      icon: <Zap className="text-orange-400" size={28} />,
      title: "Lightning Fast",
      description: "Optimized performance with instant feedback and parallel processing capabilities.",
    },
    {
      icon: <FileSearch className="text-pink-400" size={28} />,
      title: "Deep Analysis",
      description: "Comprehensive code analysis with actionable insights and detailed reports.",
    },
    {
      icon: <TrendingUp className="text-emerald-400" size={28} />,
      title: "Growth Metrics",
      description: "Track your progress over time with detailed analytics and trend visualization.",
    },
  ];

  const techStack = [
    { name: "Node.js", icon: <Code2 size={16} /> },
    { name: "React", icon: <Code2 size={16} /> },
    { name: "TypeScript", icon: <Code2 size={16} /> },
    { name: "TailwindCSS", icon: <Code2 size={16} /> },
    { name: "Framer Motion", icon: <Code2 size={16} /> },
    { name: "Docker", icon: <Code2 size={16} /> },
  ];

  return (
    <div className="font-sans text-gray-100 bg-gray-900 overflow-x-hidden">
      {/* -------------------- Hero / Upload (UNCHANGED) -------------------- */}
      <motion.div
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6"
        style={{
          backgroundImage: "url(/image.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity,
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
                className={`w-full max-w-2xl rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center transition-all border-2 border-dashed ${dragging ? "border-blue-400 bg-blue-400/10 scale-[1.02]" : "border-white/30 bg-white/5"
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
                  <motion.div
                    className="h-full bg-blue-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${securityScore}%` }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* -------------------- Features Section (Enhanced) -------------------- */}
      <section className="relative py-24 px-6 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Zap size={16} />
              Powerful Features
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              Why Developers Love Dev Capsule
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Everything you need to analyze, secure, and improve your codebase in one powerful platform
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} delay={index * 0.05} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* -------------------- Demo Section (Enhanced) -------------------- */}
      <section className="relative py-24 px-6 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Play size={16} />
              Live Demo
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent">
              See It In Action
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Watch how Dev Capsule analyzes your code in real-time, providing instant feedback and actionable insights
            </p>
          </motion.div>

          <motion.div
            className="relative max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="relative rounded-2xl overflow-hidden border-2 border-gray-700/50 shadow-2xl">
              {/* Enhanced glow effect */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 shadow-[0_0_100px_rgba(59,130,246,0.2)] rounded-2xl" />
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
              </div>

              {/* Video */}
              <video
                ref={videoRef}
                className="w-full"
                src="/HowItWorks.mp4"
                poster="/howitworks-poster.png"
                autoPlay
                loop
                muted={!isSoundOn}
                playsInline
                preload="auto"
              />

              {/* Enhanced status indicators */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <div className="bg-black/70 backdrop-blur-md px-4 py-2 rounded-lg text-sm border border-gray-600/50 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-white font-medium">Live Pipeline Execution</span>
                </div>
              </div>

              <div className="absolute top-4 right-4">
                <div className="bg-green-500/20 backdrop-blur-md text-green-400 px-4 py-2 rounded-lg text-sm border border-green-500/30 flex items-center gap-2 font-medium">
                  <Check size={16} />
                  Verified
                </div>
              </div>

              {/* Enhanced controls */}
              <div className="absolute bottom-4 right-4 flex gap-3">
                <motion.button
                  onClick={() => {
                    if (!videoRef.current) return;
                    const newSoundState = !isSoundOn;
                    setIsSoundOn(newSoundState);
                    videoRef.current.muted = !newSoundState;
                  }}
                  className="bg-black/70 hover:bg-black/90 backdrop-blur-md p-3 rounded-full transition-all duration-200 border border-gray-600/50 hover:border-blue-500/50"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Toggle sound"
                >
                  {isSoundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </motion.button>

                <motion.button
                  onClick={togglePlay}
                  className="bg-black/70 hover:bg-black/90 backdrop-blur-md p-3 rounded-full transition-all duration-200 border border-gray-600/50 hover:border-blue-500/50"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Toggle play"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </motion.button>
              </div>
            </div>

            {/* Enhanced timeline */}
            <motion.div
              className="flex justify-between items-center mt-8 max-w-4xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              {["Upload", "Scan", "Execute", "Verify", "Score"].map((step, index) => (
                <div key={step} className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center text-blue-400 font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="text-xs text-gray-400 font-medium">{step}</span>
                </div>
              ))}
              <div className="absolute top-5 left-8 right-8 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 -z-10" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* -------------------- Technical Details (Enhanced) -------------------- */}
      <section className="relative py-24 px-6 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Code2 size={16} />
              Tech Stack
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
              Built With Modern Technologies
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Powered by cutting-edge tools and frameworks for maximum performance and reliability
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <StatCard
              value="Node.js & React"
              label="Core Stack"
              icon={<Code2 size={24} />}
            />
            <StatCard
              value="SQLite / JSON"
              label="Lightweight DB"
              icon={<Lock size={24} />}
            />
            <StatCard
              value="Docker Ready"
              label="Easy Deployment"
              icon={<Zap size={24} />}
            />
          </div>

          <motion.div
            className="flex flex-wrap justify-center gap-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {techStack.map((tech) => (
              <TechBadge key={tech.name} {...tech} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* -------------------- Community CTA (Enhanced) -------------------- */}
      <section className="relative py-24 px-6 bg-gradient-to-b from-gray-800 to-gray-900">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-blue-500/5 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Users size={16} />
              Open Source
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-green-100 to-white bg-clip-text text-transparent">
              Join the Dev Capsule Community
            </h2>
            <p className="text-gray-400 text-lg mb-12 max-w-3xl mx-auto leading-relaxed">
              Explore the open-source code, contribute to the project, and collaborate with developers worldwide.
              Together, we're building the future of code analysis.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center gap-6 mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <CTAButton
              href="https://github.com/Pineapplers-Lab/Dev-Time-Capsule"
              primary
            >
              <Github size={20} />
              Explore Source Code
            </CTAButton>

            <CTAButton
              href="https://github.com/Pineapplers-Lab/Dev-Time-Capsule?tab=contributing-ov-file"
              primary={false}
            >
              <BookOpen size={20} />
              Contribution Guide
            </CTAButton>

          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <StatCard value="2" label="Stars" icon={<Star size={20} className="text-yellow-400" />} />
            <StatCard value="2" label="Contributors" icon={<Users size={20} className="text-blue-400" />} />
            <StatCard value="1" label="Forks" icon={<Github size={20} className="text-purple-400" />} />
            <StatCard value="1+" label="Releases" icon={<TrendingUp size={20} className="text-green-400" />} />
          </motion.div>
        </div>
      </section>

      {/* -------------------- Footer (Enhanced) -------------------- */}
      <footer className="relative bg-gray-950 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Terminal size={20} className="text-white" />
                </div>
                <span className="text-xl font-bold text-white">Dev Capsule</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Analyze, secure, and improve your codebase with powerful open-source tools.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#demo" className="text-gray-400 hover:text-white transition-colors">Demo</a></li>
                <li><a href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/roadmap" className="text-gray-400 hover:text-white transition-colors">Roadmap</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/docs" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                    Documentation <ExternalLink size={12} />
                  </a>
                </li>
                <li>
                  <a href="https://github.com/devcapsule" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                    GitHub <ExternalLink size={12} />
                  </a>
                </li>
                <li><a href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="/changelog" className="text-gray-400 hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <h3 className="text-white font-semibold mb-4">Community</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://discord.gg/devcapsule" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                    Discord <ExternalLink size={12} />
                  </a>
                </li>
                <li>
                  <a href="https://twitter.com/devcapsule" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                    Twitter <ExternalLink size={12} />
                  </a>
                </li>
                <li><a href="/contributing" className="text-gray-400 hover:text-white transition-colors">Contributing</a></li>
                <li><a href="/code-of-conduct" className="text-gray-400 hover:text-white transition-colors">Code of Conduct</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Dev Capsule. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="/license" className="text-gray-400 hover:text-white transition-colors">MIT License</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}