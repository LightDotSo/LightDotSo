module.exports = {
  "*": ["pnpm run license:cmd add"],
  "*.{js,ts,tsx}": ["pnpm run eslint:cmd --fix"],
  "*.{ts,tsx}": ["sh -c 'pnpm run tsc:turbo && echo \"\"'"],
  "*.{md,json,yml}": ["pnpm run prettier:cmd --write"],
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
  "thunder-tests/**/*.json": ["./scripts/check-thunder-url.sh"],
};
