import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: [
    "*.janeway.replit.dev",
    "*.replit.dev",
  ],
};

export default nextConfig;
