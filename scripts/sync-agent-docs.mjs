import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SOURCE_REPO = "avikalpg/byok-relay";
const SOURCE_REF = process.env.BYOK_RELAY_AGENT_DOCS_REF || "main";
const API_COMMIT_URL = `https://api.github.com/repos/${SOURCE_REPO}/commits/${SOURCE_REF}`;
const CHECK = process.argv.includes("--check");
const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const LOCAL_LLMS = path.join(PUBLIC_DIR, "llms.txt");

const canonicalSkill = {
  sourcePath: "skills/byok-relay/SKILL.md",
  destinations: ["skill", "skill.md"],
};

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { "user-agent": "byok-relay-website-agent-docs-sync" } });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  return res.text();
}

async function fetchSourceCommit() {
  try {
    const res = await fetch(API_COMMIT_URL, {
      headers: {
        accept: "application/vnd.github+json",
        "user-agent": "byok-relay-website-agent-docs-sync",
      },
    });
    if (!res.ok) return SOURCE_REF;
    const data = await res.json();
    return typeof data.sha === "string" ? data.sha : SOURCE_REF;
  } catch {
    return SOURCE_REF;
  }
}

function validateSkill(text) {
  const required = [
    "## Generating the API key input UI",
    "byok-relay:relay-token:",
    "Do not share a relay token across team members",
  ];
  for (const marker of required) {
    if (!text.includes(marker))
      throw new Error(`Canonical SKILL.md missing required marker: ${marker}`);
  }

  const forbidden = [
    "the admin can share their relay token",
    "localStorage.setItem('relay_token', token)",
    'localStorage.setItem("relay_token", token)',
  ];
  for (const marker of forbidden) {
    if (text.includes(marker))
      throw new Error(`Canonical SKILL.md still contains stale guidance: ${marker}`);
  }
}

function validateLlms(text) {
  const required = ["# byok-relay", "https://byokrelay.com/skill", "Users bring their own keys"];
  for (const marker of required) {
    if (!text.includes(marker))
      throw new Error(`public/llms.txt missing required marker: ${marker}`);
  }
}

async function assertMatches(destination, expected) {
  const fullPath = path.join(PUBLIC_DIR, destination);
  let current;
  try {
    current = await readFile(fullPath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new Error(`${destination} is missing; run npm run sync:agent-docs`);
    }
    throw error;
  }
  if (current !== expected) {
    throw new Error(
      `${destination} drifted from ${SOURCE_REPO}/${SOURCE_REF}/${canonicalSkill.sourcePath}; run npm run sync:agent-docs`,
    );
  }
}

async function main() {
  await mkdir(PUBLIC_DIR, { recursive: true });
  const sourceCommit = await fetchSourceCommit();
  // Always fetch the skill from the resolved commit SHA so the manifest and
  // downloaded content are guaranteed to be aligned, even when SOURCE_REF is a
  // mutable pointer such as "main" that can advance between resolution and fetch.
  if (sourceCommit === SOURCE_REF) {
    // Could not resolve SHA — fail fast rather than recording a mismatched manifest.
    throw new Error(
      `Could not resolve commit SHA for ${SOURCE_REPO}@${SOURCE_REF}. ` +
      `Check network connectivity or BYOK_RELAY_AGENT_DOCS_REF env var.`,
    );
  }
  const RAW_SHA_BASE = `https://raw.githubusercontent.com/${SOURCE_REPO}/${sourceCommit}`;
  const skillText = await fetchText(`${RAW_SHA_BASE}/${canonicalSkill.sourcePath}`);
  validateSkill(skillText);

  const manifestFiles = [];
  const skillHash = sha256(skillText);
  for (const destination of canonicalSkill.destinations) {
    if (CHECK) {
      await assertMatches(destination, skillText);
    } else {
      await writeFile(path.join(PUBLIC_DIR, destination), skillText);
    }
    manifestFiles.push({
      source: `${SOURCE_REPO}/${canonicalSkill.sourcePath}`,
      destination,
      sha256: skillHash,
    });
  }

  const llmsText = await readFile(LOCAL_LLMS, "utf8");
  validateLlms(llmsText);
  manifestFiles.push({
    source: "public/llms.txt",
    destination: "llms.txt",
    sha256: sha256(llmsText),
  });

  const manifest = {
    canonicalSkillRepo: SOURCE_REPO,
    canonicalSkillRef: SOURCE_REF,
    canonicalSkillCommit: sourceCommit,
    syncedAt: new Date().toISOString(),
    files: manifestFiles,
  };

  if (!CHECK) {
    await writeFile(
      path.join(PUBLIC_DIR, "agent-docs-revision.json"),
      `${JSON.stringify(manifest, null, 2)}\n`,
    );
    console.log(`Synced skill docs from ${SOURCE_REPO}@${sourceCommit}`);
  } else {
    // Validate the revision manifest so that a deleted or tampered
    // agent-docs-revision.json is caught even when skill and skill.md match.
    const manifestPath = path.join(PUBLIC_DIR, "agent-docs-revision.json");
    let storedManifest;
    try {
      storedManifest = JSON.parse(await readFile(manifestPath, "utf8"));
    } catch (error) {
      if (error?.code === "ENOENT") {
        throw new Error(
          "agent-docs-revision.json is missing; run npm run sync:agent-docs",
        );
      }
      throw error;
    }
    const errors = [];
    if (storedManifest.canonicalSkillRepo !== manifest.canonicalSkillRepo) {
      errors.push(
        `canonicalSkillRepo mismatch: stored=${storedManifest.canonicalSkillRepo} expected=${manifest.canonicalSkillRepo}`,
      );
    }
    if (storedManifest.canonicalSkillCommit !== manifest.canonicalSkillCommit) {
      errors.push(
        `canonicalSkillCommit mismatch: stored=${storedManifest.canonicalSkillCommit} expected=${manifest.canonicalSkillCommit}`,
      );
    }
    for (const expectedFile of manifest.files) {
      const stored = (storedManifest.files || []).find(
        (f) => f.destination === expectedFile.destination,
      );
      if (!stored) {
        errors.push(`manifest missing entry for destination: ${expectedFile.destination}`);
      } else if (stored.sha256 !== expectedFile.sha256) {
        errors.push(
          `sha256 mismatch for ${expectedFile.destination}: stored=${stored.sha256} expected=${expectedFile.sha256}`,
        );
      } else if (stored.source !== expectedFile.source) {
        errors.push(
          `source mismatch for ${expectedFile.destination}: stored=${stored.source} expected=${expectedFile.source}`,
        );
      }
    }
    if (errors.length > 0) {
      throw new Error(
        `agent-docs-revision.json is stale or tampered; run npm run sync:agent-docs\n  ` +
          errors.join("\n  "),
      );
    }
    console.log(`Agent docs match ${SOURCE_REPO}@${sourceCommit}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
