// Root Changelog adapted from MUD.
// From: https://github.com/latticexyz/mud/blob/main/scripts/changelog.ts
// License: MIT

import { readFileSync, writeFileSync } from "node:fs";
import path from "path";
import { execa } from "execa";

const REPO_URL = "https://github.com/LightDotSo/LightDotSo";
const CHANGELOG_PATH = "CHANGELOG.md";
const CHANGELOG_DOCS_PATH = "apps/changelog/app/changelog.mdx";
const VERSION_PATH = path.join(process.cwd(), "package.json");
const INCLUDE_CHANGESETS = "diff"; // "diff" | "all"

enum ChangeType {
  PATCH,
  MINOR,
  MAJOR,
}

const changeTypes = {
  patch: ChangeType.PATCH,
  minor: ChangeType.MINOR,
  major: ChangeType.MAJOR,
} as const;

type ChangelogItem = {
  packages: {
    package: string;
    type: string;
  }[];
  type: ChangeType;
  description: string;
};

type GitMetadata = {
  commitHash: string;
  authorName: string;
  authorEmail: string;
  title: string;
};

await appendChangelog();

async function appendChangelog() {
  await execa("git", ["checkout", "main", "--", CHANGELOG_PATH]);

  const currentChangelog = readFileSync(CHANGELOG_PATH).toString();

  const newChangelog = await renderChangelog();

  const currentVersion = getCurrentVersion();
  // if (!currentVersion) {
  //   console.error("Could not find current version in CHANGELOG");
  //   return;
  // }
  const newVersion = await getVersion();
  if (currentVersion === newVersion) {
    console.info(`Version ${newVersion} is already in the CHANGELOG`);
    return;
  }

  writeFileSync(CHANGELOG_PATH, `${newChangelog}\n${currentChangelog}`);
  writeFileSync(CHANGELOG_DOCS_PATH, `${newChangelog}\n${currentChangelog}`);
}

async function renderChangelog() {
  const changes = await getChanges(INCLUDE_CHANGESETS);
  // const version = await getVersion();
  // const date = new Date();

  return `## [Unreleased]

${await renderChangelogItems("Major changes", changes.major)}\n
${await renderChangelogItems("Minor changes", changes.minor)}\n
${await renderChangelogItems("Patch changes", changes.patch)}\n
`;
}

async function renderChangelogItems(
  headline: string,
  changelogItems: (ChangelogItem & GitMetadata)[],
) {
  if (changelogItems.length === 0) return "";

  let output = `### ${headline}\n`;

  for (const changelogItem of changelogItems) {
    output += `**[${changelogItem.title}](${REPO_URL}/commit/${
      changelogItem.commitHash
    })** (${changelogItem.packages.map(e => e.package).join(", ")})`;
    output += `\n${changelogItem.description}\n`;
  }

  return output;
}

async function getVersion() {
  return (await import(VERSION_PATH)).default.version;
}

async function getChanges(include: "diff" | "all") {
  const changesetsToInclude: string[] = [];

  if (include === "diff") {
    const changesetDiff = (
      await execa("git", ["diff", "main", ".changeset/pre.json"])
    ).stdout;

    const addedLinesRegex = /\+\s+"(?!.*:)([^"]+)"/g;
    changesetsToInclude.push(
      ...[...changesetDiff.matchAll(addedLinesRegex)].map(match => match[1]),
    );
  } else if (include === "all") {
    changesetsToInclude.push(
      ...(await import(path.join(process.cwd(), ".changeset/pre.json"))).default
        .changesets,
    );
  }

  const changesetContents = await Promise.all(
    changesetsToInclude.map(async addedChangeset => {
      const changesetPath = `.changeset/${addedChangeset}.md`;
      const changeset = readFileSync(changesetPath).toString();
      const gitLog = (await execa("git", ["log", changesetPath])).stdout;
      return { ...parseChangeset(changeset), ...parseGitLog(gitLog) };
    }),
  );

  const patch = changesetContents.filter(
    change => change.type === ChangeType.PATCH,
  );
  const minor = changesetContents.filter(
    change => change.type === ChangeType.MINOR,
  );
  const major = changesetContents.filter(
    change => change.type === ChangeType.MAJOR,
  );

  return { patch, minor, major };
}

function notNull<T>(element: T | undefined | null | ""): element is T {
  return Boolean(element);
}

function parseChangeset(changeset: string): ChangelogItem {
  const separatorString = "---\n";
  let separatorIndex = changeset.indexOf(separatorString);
  changeset = changeset.substring(separatorIndex + separatorString.length - 1);

  separatorIndex = changeset.indexOf(separatorString);
  const packages = changeset
    .substring(0, separatorIndex)
    .split("\n")
    .map(line => {
      const match = line.match(/"([^"]+)":\s*(\w+)/);
      if (match)
        return {
          package: match[1],
          type: match[2] as "patch" | "minor" | "major",
        };
    })
    .filter(notNull);
  const description = changeset.substring(
    separatorIndex + separatorString.length,
  );

  const type = Math.max(...packages.map(change => changeTypes[change.type]));

  return { packages, description, type };
}

function parseGitLog(log: string): GitMetadata {
  const [, commitHash, authorName, authorEmail, title] =
    log.match(
      /commit (\w+)[\s\S]*?Author: ([^<]+) <([^>]+)>[\s\S]*?\n\n\s{4}([^\n]+)/,
    ) ?? [];

  return { commitHash, authorName, authorEmail, title };
}

function getCurrentVersion() {
  const currentChangelog = readFileSync(CHANGELOG_PATH).toString();
  const lines = currentChangelog.split("\n");
  for (let line of lines) {
    const versionMatch = line.match(/\[([\d+.]*)\]/);
    if (versionMatch) {
      return versionMatch[1];
    }
  }
  return null;
}
