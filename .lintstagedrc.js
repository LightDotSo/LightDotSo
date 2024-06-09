module.exports = {
  "*": ["pnpm run license:cmd add"],
  "*.{js,mjs,ts,tsx}": [
    // "pnpm run eslint:cmd --fix",
    "pnpm run oxlint:cmd --fix",
    "pnpm run prettier:cmd --write",
  ],
  "*.{ts,tsx}": ["sh -c 'pnpm turbo run tsc && echo \"\"'"],
  "*.{md,json,yml}": ["pnpm run prettier:cmd --write"],
  "*.rs": [
    "sh -c 'pnpm run clippy:cmd && echo \"\"'",
    // "sh -c 'pnpm run cargo:fmt:cmd && echo \"\"'",
  ],
  "*.{py,ipynb}": ["pnpm run ruff:lint:cmd", "pnpm run ruff:fmt:cmd"],
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
  "thunder-tests/**/*.json": ["./scripts/check_thunder_url.sh"],
};
