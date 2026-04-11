import { NextRequest, NextResponse } from "next/server";
import { orchestrateScan } from "@/lib/agents/orchestrator";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error("GOOGLE_API_KEY is not configured");
      return NextResponse.json(
        { error: "Server configuration error: Missing API key" },
        { status: 500 }
      );
    }

    const { repoUrl } = await req.json();

    if (!repoUrl) {
      return NextResponse.json({ error: "Missing repoUrl" }, { status: 400 });
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
