#!/usr/bin/env node
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = "avikalpg/byok-relay";
const DEFAULT_REF = "main";
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_DIR = resolve(ROOT, "public");
const CHECK = process.argv.includes("--check");
const REF = process.env.BYOK_RELAY_REF || DEFAULT_REF;

const SOURCES = [
  {
    name: "skill",
    sourcePath: "skills/byok-relay/SKILL.md",
    destinations: ["skill", "skill.md"],
    contentType: "text/markdown; charset=utf-8",
  },
  {
    name: "llms",
    sourcePath: "llms.txt",
    destinations: ["llms.txt"],
    contentType: "text/markdown; charset=utf-8",
  },
];

function rawUrl(path) {
  return `https://raw.githubusercontent.com/${REPO}/${encodeURIComponent(REF)}/${path}`;
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "byok-relay-website-agent-doc-sync" },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

async function getSourceRevision() {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${REPO}/commits/${encodeURIComponent(REF)}`,
      {
        headers: {
          accept: "application/vnd.github+json",
          "user-agent": "byok-relay-website-agent-doc-sync",
        },
      },
    );
    if (!response.ok) return REF;
    const data = await response.json();
    return typeof data.sha === "string" ? data.sha : REF;
  } catch {
    return REF;
  }
}

async function assertFileMatches(path, expected) {
  let actual;
  try {
    actual = await readFile(path, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new Error(`${path} is missing`);
    }
    throw error;
  }
  if (actual !== expected) {
    throw new Error(`${path} is out of sync with ${REPO}@${REF}`);
  }
}

async function main() {
  await mkdir(PUBLIC_DIR, { recursive: true });
  const revision = await getSourceRevision();
  const manifest = {
    generatedBy: "scripts/sync-agent-docs.mjs",
    sourceRepo: `https://github.com/${REPO}`,
    sourceRef: REF,
    sourceRevision: revision,
    files: {},
  };

  for (const source of SOURCES) {
    const content = await fetchText(rawUrl(source.sourcePath));
    manifest.files[source.name] = {
      sourcePath: source.sourcePath,
      sha256: sha256(content),
      destinations: source.destinations.map((name) => `/` + name),
      contentType: source.contentType,
    };

    for (const destination of source.destinations) {
      const destinationPath = resolve(PUBLIC_DIR, destination);
      if (CHECK) {
        await assertFileMatches(destinationPath, content);
      } else {
        await writeFile(destinationPath, content);
      }
    }
  }

  const manifestPath = resolve(PUBLIC_DIR, "agent-docs-revision.json");
  const manifestContent = `${JSON.stringify(manifest, null, 2)}\n`;
  if (CHECK) {
    await assertFileMatches(manifestPath, manifestContent);
    console.log(`Agent docs are in sync with ${REPO}@${revision}.`);
  } else {
    await writeFile(manifestPath, manifestContent);
    console.log(`Synced agent docs from ${REPO}@${revision}.`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
