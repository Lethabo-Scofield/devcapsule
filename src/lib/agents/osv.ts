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

async function queryOsv(ecosystem: string, packageName: string, version: string): Promise<OsvVulnerability[]> {
  const cleanedVersion = cleanVersion(version);
  if (!cleanedVersion || cleanedVersion === "*") return [];

  try {
    const res = await fetch("https://api.osv.dev/v1/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        package: { name: packageName, ecosystem },
        version: cleanedVersion,
      }),
    });

    if (!res.ok) return [];
    const data = await res.json();

    if (!data.vulns || data.vulns.length === 0) return [];

    return data.vulns.map((v: any) => {
      const severityObj = v.severity?.[0];
      let severity = "Medium";
      if (severityObj?.type === "CVSS_V3") {
        const score = parseFloat(severityObj.score?.split("/")[0] || "0");
        if (score >= 9) severity = "Critical";
        else if (score >= 7) severity = "High";
        else if (score >= 4) severity = "Medium";
        else severity = "Low";
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

      return {
        id: v.id || "Unknown",
        summary: v.summary || v.details?.slice(0, 200) || "No description available",
        severity,
        package_name: packageName,
        affected_version: cleanedVersion,
        fixed_version: fixedRange?.fixed || "No fix available",
        references: (v.references || []).map((r: any) => r.url).slice(0, 3),
      };
    });
  } catch (err) {
    console.error(`OSV query failed for ${packageName}:`, err);
    return [];
  }
}

export async function scanNpmDependencies(
  dependencies: Record<string, string>
): Promise<OsvVulnerability[]> {
  const packages = Object.entries(dependencies).slice(0, 30);

  const results = await Promise.allSettled(
    packages.map(([name, version]) => queryOsv("npm", name, version))
  );

  return results
    .filter((r): r is PromiseFulfilledResult<OsvVulnerability[]> => r.status === "fulfilled")
    .flatMap((r) => r.value);
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

  const results = await Promise.allSettled(
    packages.map((p) => queryOsv("PyPI", p.name, p.version))
  );

  return results
    .filter((r): r is PromiseFulfilledResult<OsvVulnerability[]> => r.status === "fulfilled")
    .flatMap((r) => r.value);
}
