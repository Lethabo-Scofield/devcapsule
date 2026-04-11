export interface OsvVulnerability {
  id: string;
  summary: string;
  severity: string;
  package_name: string;
  affected_version: string;
  fixed_version: string;
  references: string[];
}

function cleanVersion(raw: string): string {
  return raw.replace(/^[\^~>=<!\s*]+/, "").split(/\s/)[0].replace(/,.*$/, "");
}

function extractResolvedVersions(lockJson: any): Record<string, string> {
  const resolved: Record<string, string> = {};

  if (lockJson?.packages) {
    for (const [key, val] of Object.entries(lockJson.packages as Record<string, any>)) {
      if (!key || key === "") continue;
      const name = key.replace(/^node_modules\//, "");
      if (val?.version) {
        resolved[name] = val.version;
      }
    }
  }

  if (lockJson?.dependencies && Object.keys(resolved).length === 0) {
    for (const [name, val] of Object.entries(lockJson.dependencies as Record<string, any>)) {
      if ((val as any)?.version) {
        resolved[name] = (val as any).version;
      }
    }
  }

  return resolved;
}

async function queryOsvBatch(
  ecosystem: string,
  packages: { name: string; version: string }[]
): Promise<OsvVulnerability[]> {
  if (packages.length === 0) return [];

  try {
    const queries = packages.map((p) => ({
      package: { name: p.name, ecosystem },
      version: p.version,
    }));

    const res = await fetch("https://api.osv.dev/v1/querybatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ queries }),
    });

    if (!res.ok) {
      console.error(`OSV batch query failed: ${res.status}`);
      return [];
    }

    const data = await res.json();
    const results: OsvVulnerability[] = [];

    if (!data.results) return [];

    for (let i = 0; i < data.results.length; i++) {
      const entry = data.results[i];
      const pkg = packages[i];
      if (!entry.vulns || entry.vulns.length === 0) continue;

      for (const v of entry.vulns) {
        const severityObj = v.severity?.[0];
        let severity = "Medium";
        if (severityObj?.type === "CVSS_V3") {
          const scoreStr = severityObj.score || "";
          const match = scoreStr.match(/CVSS:[^/]+\/AV:\w\/AC:\w\/PR:\w\/UI:\w\/S:\w\/C:\w\/I:\w\/A:\w/i);
          if (match) {
            const parts = scoreStr.split("/");
            const baseScore = parseFloat(parts[0]?.replace(/^CVSS:\d+\.\d+\//, "") || "0");
            if (!isNaN(baseScore) && baseScore > 0) {
              if (baseScore >= 9) severity = "Critical";
              else if (baseScore >= 7) severity = "High";
              else if (baseScore >= 4) severity = "Medium";
              else severity = "Low";
            }
          }
        }
        if (v.database_specific?.severity) {
          const dbSev = v.database_specific.severity;
          const normalized = dbSev.charAt(0).toUpperCase() + dbSev.slice(1).toLowerCase();
          if (["Critical", "High", "Medium", "Low"].includes(normalized)) {
            severity = normalized;
          }
        }

        const affected = v.affected?.[0];
        const fixedRange = affected?.ranges?.[0]?.events?.find((e: any) => e.fixed);

        results.push({
          id: v.id || "Unknown",
          summary: v.summary || v.details?.slice(0, 200) || "No description available",
          severity,
          package_name: pkg.name,
          affected_version: pkg.version,
          fixed_version: fixedRange?.fixed || "No fix available",
          references: (v.references || []).map((r: any) => r.url).slice(0, 3),
        });
      }
    }

    return results;
  } catch (err) {
    console.error("OSV batch query error:", err);
    return [];
  }
}

export async function scanNpmDependencies(
  dependencies: Record<string, string>,
  lockJson?: any
): Promise<OsvVulnerability[]> {
  const resolvedVersions = lockJson ? extractResolvedVersions(lockJson) : {};

  const packages: { name: string; version: string }[] = [];

  for (const [name, rangeVersion] of Object.entries(dependencies)) {
    const exactVersion = resolvedVersions[name] || cleanVersion(rangeVersion);
    if (exactVersion && exactVersion !== "*") {
      packages.push({ name, version: exactVersion });
    }
  }

  console.log(`[OSV] Scanning ${packages.length} npm packages (lockfile: ${Object.keys(resolvedVersions).length > 0 ? "yes" : "no"})`);

  const batches: { name: string; version: string }[][] = [];
  for (let i = 0; i < packages.length; i += 25) {
    batches.push(packages.slice(i, i + 25));
  }

  const results = await Promise.allSettled(
    batches.map((batch) => queryOsvBatch("npm", batch))
  );

  const vulns = results
    .filter((r): r is PromiseFulfilledResult<OsvVulnerability[]> => r.status === "fulfilled")
    .flatMap((r) => r.value);

  const seen = new Set<string>();
  return vulns.filter((v) => {
    const key = `${v.id}-${v.package_name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parsePypiLine(line: string): { name: string; version: string } | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("-")) return null;

  const match = trimmed.match(/^([a-zA-Z0-9._-]+)\s*(?:[=!<>~]=?)\s*(.+)/);
  if (match) {
    const version = cleanVersion(match[2]);
    return version ? { name: match[1], version } : null;
  }

  return null;
}

export async function scanPypiDependencies(
  requirementsTxt: string
): Promise<OsvVulnerability[]> {
  const packages = requirementsTxt
    .split("\n")
    .map(parsePypiLine)
    .filter((p): p is { name: string; version: string } => p !== null)
    .slice(0, 30);

  const batches: { name: string; version: string }[][] = [];
  for (let i = 0; i < packages.length; i += 25) {
    batches.push(packages.slice(i, i + 25));
  }

  const results = await Promise.allSettled(
    batches.map((batch) => queryOsvBatch("PyPI", batch))
  );

  return results
    .filter((r): r is PromiseFulfilledResult<OsvVulnerability[]> => r.status === "fulfilled")
    .flatMap((r) => r.value);
}
