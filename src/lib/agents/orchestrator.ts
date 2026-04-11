import { fetchRepoData } from "./github";
import { runArchitectAgent } from "./architect";
import { runSecurityAgent } from "./security";
import { runDxAgent } from "./dx";

export interface ScanResult {
  metadata: {
    score: number;
    issues: number;
    health: "Stable" | "Warning" | "Critical";
    scan_source: string;
  };
  agents_reports: {
    architect: {
      stack: string[];
      summary: string;
      components: { name: string; tier: string; purpose: string }[];
    };
    security: {
      vulnerabilities: {
        pkg: string;
        cve: string;
        severity: string;
        fix_command: string;
        desc: string;
        osv_url: string;
      }[];
    };
    dx: {
      steps: {
        title: string;
        cmd: string;
        desc: string;
        priority: string;
      }[];
    };
  };
}

export async function orchestrateScan(repoUrl: string): Promise<ScanResult> {
  console.log("[Orchestrator] Fetching repository data...");
  const repoData = await fetchRepoData(repoUrl);
  console.log(`[Orchestrator] Found ${repoData.fileTree.length} files in ${repoData.owner}/${repoData.repo}`);

  console.log("[Orchestrator] Launching Architect and Security agents in parallel...");
  const [architectReport, securityReport] = await Promise.all([
    runArchitectAgent(repoData).catch((err) => {
      console.error("[Architect Agent] Failed:", err);
      return { stack: [], summary: "Analysis failed", components: [] };
    }),
    runSecurityAgent(repoData).catch((err) => {
      console.error("[Security Agent] Failed:", err);
      return { vulnerabilities: [], scan_source: "failed" };
    }),
  ]);

  console.log(`[Orchestrator] Architect found ${architectReport.stack.length} technologies`);
  console.log(`[Orchestrator] Security found ${securityReport.vulnerabilities.length} vulnerabilities via ${securityReport.scan_source}`);

  console.log("[Orchestrator] Launching DX agent with combined context...");
  const dxReport = await runDxAgent(repoData, securityReport.vulnerabilities).catch((err) => {
    console.error("[DX Agent] Failed:", err);
    return { steps: [] };
  });

  console.log(`[Orchestrator] DX agent generated ${dxReport.steps.length} steps`);

  const normalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  const criticalCount = securityReport.vulnerabilities.filter(
    (v) => normalize(v.severity) === "Critical"
  ).length;
  const highCount = securityReport.vulnerabilities.filter(
    (v) => normalize(v.severity) === "High"
  ).length;
  const totalIssues = securityReport.vulnerabilities.length;

  let health: "Stable" | "Warning" | "Critical" = "Stable";
  if (criticalCount > 0) health = "Critical";
  else if (highCount > 0) health = "Warning";

  const score = Math.max(0, 100 - criticalCount * 20 - highCount * 10 - (totalIssues - criticalCount - highCount) * 3);

  return {
    metadata: {
      score,
      issues: totalIssues,
      health,
      scan_source: securityReport.scan_source,
    },
    agents_reports: {
      architect: architectReport,
      security: { vulnerabilities: securityReport.vulnerabilities },
      dx: dxReport,
    },
  };
}
