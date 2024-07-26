module.exports = {
  "*": ["pnpm run license:cmd add"],
  "*.{js,ts,cjs,mjs,d.cts,d.mts,jsx,tsx,json,jsonc}": [
    "pnpm biome check --write --unsafe --no-errors-on-unmatched",
  ],
  "*.{md}": ["pnpm dprint fmt"],
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
