import { NextRequest, NextResponse } from "next/server";

const MODEL_NAME = "gemini-2.5-flash-preview-04-17";
const apiKey = process.env.GOOGLE_API_KEY;

export async function POST(req: NextRequest) {
  try {
    if (!apiKey) {
      console.error("GOOGLE_API_KEY is not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const { repoUrl } = await req.json();

    if (!repoUrl) {
      return NextResponse.json({ error: "Missing repoUrl" }, { status: 400 });
    }

    const systemPrompt = `
      You are the Orchestrator for "Dev Capsule", a multi-agent security and architecture platform.
      Coordinate three agents:
      1. ARCHITECT: Maps project structure, stack, and components.
      2. SECURITY: Uses OSV.dev and GitHub Advisory for vulnerabilities.
      3. DX SPECIALIST: Provides onboarding steps and CLI remediation commands.

      RESPONSE SCHEMA (MANDATORY JSON):
      {
        "metadata": { "score": number, "issues": number, "health": "Stable"|"Warning"|"Critical" },
        "agents_reports": {
          "architect": { "stack": string[], "summary": string, "components": { name: string, tier: string, purpose: string }[] },
          "security": { "vulnerabilities": { pkg: string, cve: string, severity: "Critical"|"High"|"Medium"|"Low", fix_command: string, desc: string, osv_url: string }[] },
          "dx": { "steps": { title: string, cmd: string, desc: string, priority: string }[] }
        }
      }
    `;

    const userQuery = `
      Analyze repository at ${repoUrl}.
      Cross-reference all dependencies with OSV.dev.
      Provide remediation shell commands for vulnerabilities.
      Multi-agent assessment of architecture, security, and DX.
      Respond ONLY in JSON format as described in the schema.
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userQuery }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1
          }
        }),
      }
    );

    const result = await response.json();

    // Robust extraction: find first text-containing part
    const parts = result?.candidates?.[0]?.content?.parts;
    const textPart = parts?.find((p: any) => typeof p.text === "string");

    if (!textPart?.text) {
      console.error("Gemini raw response:", JSON.stringify(result, null, 2));
      return NextResponse.json(
        { error: "Model returned no text output" },
        { status: 502 }
      );
    }

    // Ensure the JSON is valid before returning
    let parsed;
    try {
      parsed = JSON.parse(textPart.text);
    } catch (err) {
      console.error("Failed to parse model JSON:", textPart.text, err);
      return NextResponse.json(
        { error: "Model returned invalid JSON" },
        { status: 502 }
      );
    }

    return NextResponse.json({ content: JSON.stringify(parsed) });

  } catch (err) {
    console.error("API route failure:", err);
    return NextResponse.json(
      { error: "Failed to fetch model response" },
      { status: 500 }
    );
  }
}
