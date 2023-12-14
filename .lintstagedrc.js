module.exports = {
  "*": ["pnpm run license:cmd add"],
  "*.{js,ts,tsx}": ["pnpm run eslint:cmd --fix"],
  "*.{ts,tsx}": ["sh -c 'pnpm run tsc:turbo && echo \"\"'"],
  "*.{md,json,yml}": ["pnpm run prettier:cmd --write"],
  "*.rs": [
    "sh -c 'pnpm run clippy:cmd && echo \"\"'",
    "sh -c 'pnpm run cargo:fmt:cmd && echo \"\"'",
  ],
  "*.sol": [
    "pnpm run forge:fmt:cmd",
    "pnpm run forge:snapshot:cmd",
    "pnpm run solhint:cmd --fix",
  ],
  "*.toml": ["pnpm run taplo:cmd"],
  "package.json": [
    "pnpm run npm-package-json:lint",
    "pnpm run sort-package-json:fix",
  ],
  ".changeset/**/*.md": [
    "python3 scripts/py/copy_root_changeset.py",
    "pnpm run prettier:cmd --write CHANGELOG.md",
    "git add CHANGELOG.md",
  ],
  "thunder-tests/**/*.json": ["./scripts/check_thunder_url.sh"],
};
