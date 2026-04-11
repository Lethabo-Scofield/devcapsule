import { NextRequest, NextResponse } from "next/server";
import { orchestrateScan } from "@/lib/agents/orchestrator";

export const maxDuration = 60;

const rateLimit = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimit.get(ip) || [];
  const recent = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);
  rateLimit.set(ip, recent);
  if (recent.length >= RATE_LIMIT_MAX) return true;
  recent.push(now);
  rateLimit.set(ip, recent);
  return false;
}

function isValidGithubUrl(url: string): boolean {
  const trimmed = url.trim().replace(/\/+$/, "").replace(/\.git$/, "");
  return /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/?$/i.test(trimmed) ||
         /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/.test(trimmed);
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute before trying again." },
        { status: 429 }
      );
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error("GOOGLE_API_KEY is not configured");
      return NextResponse.json(
        { error: "Server configuration error: Missing API key" },
        { status: 500 }
      );
    }

    const { repoUrl } = await req.json();

    if (!repoUrl || typeof repoUrl !== "string") {
      return NextResponse.json({ error: "Missing repository URL" }, { status: 400 });
    }

    if (!isValidGithubUrl(repoUrl)) {
      return NextResponse.json({ error: "Invalid GitHub repository URL" }, { status: 400 });
    }

    console.log(`[API] Starting multi-agent scan for: ${repoUrl}`);
    const result = await orchestrateScan(repoUrl);
    console.log(`[API] Scan complete. Health: ${result.metadata.health}, Issues: ${result.metadata.issues}`);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[API] Route failure:", err);
    return NextResponse.json(
      { error: "Multi-agent scan failed. Please try again." },
      { status: 500 }
    );
  }
}
