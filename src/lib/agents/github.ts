export interface RepoData {
  repoUrl: string;
  owner: string;
  repo: string;
  packageJson: any | null;
  packageLockJson: any | null;
  requirementsTxt: string | null;
  fileTree: string[];
  readmeSnippet: string;
}

function parseRepoUrl(url: string): { owner: string; repo: string } {
  const cleaned = url
    .replace(/^https?:\/\//, "")
    .replace(/^github\.com\//, "")
    .replace(/\.git$/, "")
    .replace(/\/$/, "");
  const [owner, repo] = cleaned.split("/");
  if (!owner || !repo) throw new Error("Invalid repository URL");
  return { owner, repo };
}

async function fetchFile(owner: string, repo: string, path: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${path}`,
      { headers: { "User-Agent": "DevCapsule/1.0" } }
    );
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function fetchTree(owner: string, repo: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
      { headers: { "User-Agent": "DevCapsule/1.0" } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.tree || [])
      .filter((t: any) => t.type === "blob")
      .map((t: any) => t.path)
      .slice(0, 200);
  } catch {
    return [];
  }
}

export async function fetchRepoData(repoUrl: string): Promise<RepoData> {
  const { owner, repo } = parseRepoUrl(repoUrl);

  const [packageJsonRaw, packageLockRaw, requirementsTxt, fileTree, readmeRaw] = await Promise.all([
    fetchFile(owner, repo, "package.json"),
    fetchFile(owner, repo, "package-lock.json"),
    fetchFile(owner, repo, "requirements.txt"),
    fetchTree(owner, repo),
    fetchFile(owner, repo, "README.md"),
  ]);

  let packageJson = null;
  if (packageJsonRaw) {
    try {
      packageJson = JSON.parse(packageJsonRaw);
    } catch {}
  }

  let packageLockJson = null;
  if (packageLockRaw) {
    try {
      packageLockJson = JSON.parse(packageLockRaw);
    } catch {}
  }

  return {
    repoUrl,
    owner,
    repo,
    packageJson,
    packageLockJson,
    requirementsTxt,
    fileTree,
    readmeSnippet: readmeRaw ? readmeRaw.slice(0, 2000) : "",
  };
}
