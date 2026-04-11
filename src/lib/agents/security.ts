import { RepoData } from "./github";
import { scanNpmDependencies, scanPypiDependencies, OsvVulnerability } from "./osv";
import { callLLM } from "./grok";

export interface SecurityVuln {
  pkg: string;
  cve: string;
  severity: string;
  fix_command: string;
  desc: string;
  osv_url: string;
}

export interface SecurityReport {
  vulnerabilities: SecurityVuln[];
  scan_source: string;
}

export async function runSecurityAgent(repo: RepoData): Promise<SecurityReport> {
  let osvVulns: OsvVulnerability[] = [];
  let scanSource = "none";

  if (repo.packageJson) {
    const allDeps = {
      ...(repo.packageJson.dependencies || {}),
      ...(repo.packageJson.devDependencies || {}),
    };
    if (Object.keys(allDeps).length > 0) {
      osvVulns = await scanNpmDependencies(allDeps, repo.packageLockJson);
      scanSource = "osv.dev (npm)";
    }
  }

  if (repo.requirementsTxt) {
    const pyVulns = await scanPypiDependencies(repo.requirementsTxt);
    osvVulns = [...osvVulns, ...pyVulns];
    scanSource = scanSource === "none" ? "osv.dev (PyPI)" : `${scanSource} + osv.dev (PyPI)`;
  }

  if (osvVulns.length > 0) {
    const vulnSummary = osvVulns.map(
      (v) => `- ${v.package_name}@${v.affected_version}: ${v.id} (${v.severity}) - ${v.summary}. Fixed in: ${v.fixed_version}`
    ).join("\n");

    const systemPrompt = `You are the SECURITY agent. You received real vulnerability data from OSV.dev. Generate fix commands for each vulnerability.

Respond with JSON:
{
  "vulnerabilities": [{
    "pkg": string,
    "cve": string,
    "severity": "Critical"|"High"|"Medium"|"Low",
    "fix_command": string,
    "desc": string,
    "osv_url": string
  }]
}

For fix_command: use "npm install package@fixed_version" for npm packages or "pip install package==fixed_version" for Python packages.
For osv_url: use "https://osv.dev/vulnerability/CVE_ID"`;

    const userPrompt = `These real vulnerabilities were found by scanning OSV.dev:

${vulnSummary}

Generate the structured vulnerability report with fix commands.`;

    const raw = await callLLM(systemPrompt, userPrompt);
    try {
      const parsed = JSON.parse(raw);
      return { vulnerabilities: parsed.vulnerabilities || [], scan_source: scanSource };
    } catch {
      console.error("[Security] Failed to parse LLM response for OSV vulns:", raw.slice(0, 300));
      const fallbackVulns: SecurityVuln[] = osvVulns.map(v => ({
        pkg: v.package_name,
        cve: v.id,
        severity: v.severity,
        fix_command: `npm install ${v.package_name}@${v.fixed_version}`,
        desc: v.summary,
        osv_url: `https://osv.dev/vulnerability/${v.id}`,
      }));
      return { vulnerabilities: fallbackVulns, scan_source: scanSource };
    }
  }

  const systemPrompt = `You are the SECURITY agent. No real vulnerabilities were found via OSV.dev scanning. Based on the repository info provided, do a best-effort analysis of potential security concerns.

Respond with JSON:
{
  "vulnerabilities": [{
    "pkg": string,
    "cve": string,
    "severity": "Critical"|"High"|"Medium"|"Low",
    "fix_command": string,
    "desc": string,
    "osv_url": string
  }]
}

If no real issues exist, return an empty vulnerabilities array.`;

  const deps = repo.packageJson
    ? JSON.stringify(repo.packageJson.dependencies || {})
    : repo.requirementsTxt || "No dependency files found";

  const userPrompt = `Repository: ${repo.owner}/${repo.repo}
Dependencies: ${deps}

Analyze for potential security concerns.`;

  const raw = await callLLM(systemPrompt, userPrompt);
  try {
    const parsed = JSON.parse(raw);
    return { vulnerabilities: parsed.vulnerabilities || [], scan_source: scanSource || "ai-analysis" };
  } catch {
    console.error("[Security] Failed to parse LLM response:", raw.slice(0, 300));
    return { vulnerabilities: [], scan_source: "ai-analysis (parse error)" };
  }
}
