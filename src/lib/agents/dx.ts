import { callLLM } from "./grok";
import { RepoData } from "./github";
import { SecurityVuln } from "./security";

export interface DxStep {
  title: string;
  cmd: string;
  desc: string;
  priority: string;
}

export interface DxReport {
  steps: DxStep[];
}

export async function runDxAgent(
  repo: RepoData,
  vulnerabilities: SecurityVuln[]
): Promise<DxReport> {
  const systemPrompt = `You are the DX SPECIALIST agent. Your job is to create onboarding steps and CLI remediation commands for a project.

Respond with JSON:
{
  "steps": [{
    "title": string,
    "cmd": string,
    "desc": string,
    "priority": "High"|"Medium"|"Low"
  }]
}

Steps should include:
1. How to clone and set up the project
2. How to install dependencies
3. How to run the project
4. Remediation commands for any vulnerabilities found
5. Any other useful developer setup steps

Order by priority (High first). Keep commands practical and copy-pasteable.`;

  const vulnContext = vulnerabilities.length > 0
    ? `\n\nVulnerabilities found (provide fix commands):\n${vulnerabilities.map(
        (v) => `- ${v.pkg}: ${v.cve} (${v.severity}) - fix: ${v.fix_command}`
      ).join("\n")}`
    : "\n\nNo vulnerabilities found.";

  const deps = repo.packageJson
    ? `package.json scripts: ${JSON.stringify(repo.packageJson.scripts || {})}`
    : repo.requirementsTxt
    ? "Python project with requirements.txt"
    : "Unknown project type";

  const userPrompt = `Repository: ${repo.owner}/${repo.repo}
URL: https://github.com/${repo.owner}/${repo.repo}

Project info:
${deps}

File structure (key files):
${repo.fileTree.filter(f =>
  f.match(/\.(json|toml|yaml|yml|md|dockerfile|makefile)$/i) ||
  f.includes("config") ||
  f.includes("src/") && repo.fileTree.indexOf(f) < 20
).slice(0, 30).join("\n")}
${vulnContext}

Generate practical onboarding and remediation steps.`;

  const raw = await callLLM(systemPrompt, userPrompt);
  try {
    const parsed = JSON.parse(raw);
    return { steps: Array.isArray(parsed.steps) ? parsed.steps : [] };
  } catch {
    console.error("[DX] Failed to parse LLM response:", raw.slice(0, 300));
    throw new Error("DX agent returned invalid JSON");
  }
}
