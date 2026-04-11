import { callLLM } from "./grok";
import { RepoData } from "./github";

export interface ArchitectReport {
  stack: string[];
  summary: string;
  components: { name: string; tier: string; purpose: string }[];
}

export async function runArchitectAgent(repo: RepoData): Promise<ArchitectReport> {
  const systemPrompt = `You are the ARCHITECT agent for Dev Capsule. Your job is to analyze a repository's structure, identify the tech stack, and map out its components.

You MUST respond with valid JSON matching this schema:
{
  "stack": string[],
  "summary": string,
  "components": [{ "name": string, "tier": string, "purpose": string }]
}

- "stack" lists all technologies/frameworks/languages detected
- "summary" is a 2-3 sentence architectural overview
- "components" maps major parts of the codebase with their tier (e.g. "Frontend", "Backend", "Database", "Infrastructure", "Utility") and purpose`;

  const deps = repo.packageJson
    ? JSON.stringify({
        dependencies: repo.packageJson.dependencies || {},
        devDependencies: repo.packageJson.devDependencies || {},
      })
    : "No package.json found";

  const userPrompt = `Analyze this repository:

Repository: ${repo.owner}/${repo.repo}

File tree (first 200 files):
${repo.fileTree.join("\n")}

Dependencies:
${deps}

${repo.requirementsTxt ? `Python requirements:\n${repo.requirementsTxt.slice(0, 1000)}` : ""}

README excerpt:
${repo.readmeSnippet}

Provide your architectural analysis as JSON.`;

  const raw = await callLLM(systemPrompt, userPrompt);
  try {
    const parsed = JSON.parse(raw);
    return {
      stack: Array.isArray(parsed.stack) ? parsed.stack : [],
      summary: typeof parsed.summary === "string" ? parsed.summary : "Analysis complete",
      components: Array.isArray(parsed.components) ? parsed.components : [],
    };
  } catch {
    console.error("[Architect] Failed to parse LLM response:", raw.slice(0, 300));
    throw new Error("Architect agent returned invalid JSON");
  }
}
