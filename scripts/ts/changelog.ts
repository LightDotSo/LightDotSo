// Root Changelog adapted from MUD.
// From: https://github.com/latticexyz/mud/blob/main/scripts/changelog.ts
// License: MIT

import { readFileSync, writeFileSync } from "node:fs";
import { execa } from "execa";

const REPO_URL = "https://github.com/LightDotSo/LightDotSo";
const CHANGELOG_PATH = "CHANGELOG.md";
const CHANGELOG_DOCS_PATH = "apps/changelog/app/changelog.mdx";

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

  let currentChangelog = readFileSync(CHANGELOG_PATH).toString();

  if (currentChangelog.startsWith("## [Unreleased]")) {
    currentChangelog = currentChangelog.replace("## [Unreleased]\n", "");
  }

  const newChangelog = await renderChangelog();

  writeFileSync(CHANGELOG_PATH, `${newChangelog}\n${currentChangelog}`);
  writeFileSync(CHANGELOG_DOCS_PATH, `${newChangelog}\n${currentChangelog}`);
}

async function renderChangelog() {
  const changes = await getChanges();

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

async function getChanges() {
  const changesetsToInclude: string[] = [];

  const changesetDiff = (
    await execa("git", ["diff", "main", "--", ".changeset/pre.json"])
  ).stdout;

  const addedLinesRegex = /\+\s+"(?!.*:)([^"]+)"/g;
  changesetsToInclude.push(
    ...[...changesetDiff.matchAll(addedLinesRegex)].map(match => match[1]),
  );

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
