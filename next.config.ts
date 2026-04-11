import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: [
    "*.replit.dev",
    "*.spock.replit.dev",
    "*.janeway.replit.dev",
    "*.kirk.replit.dev",
    "*.repl.co",
  ],
};

export default nextConfig;
