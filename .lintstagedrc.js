module.exports = {
  "*": [
    "pnpm run license:cmd add",
    // "pnpm run cspell:cmd",
  ],
  "*.{js,ts,cjs,mjs,d.cts,d.mts,jsx,tsx,json,jsonc,css,graphql}": [
    "pnpm biome:cmd",
  ],
  // "*.{md,mdx}": ["pnpm dprint fmt"],
  "*.rs": [
    "sh -c 'pnpm run clippy:cmd && echo \"\"'",
    "sh -c 'pnpm run cargo:fmt:cmd && echo \"\"'",
  ],
  "*.{py,ipynb}": ["pnpm run ruff:lint:cmd", "pnpm run ruff:fmt:cmd"],
  "*.sol": [
    "pnpm run forge:fmt:cmd",
    "pnpm run forge:snapshot:cmd",
    "pnpm run solhint:cmd --fix",
  ],
  "*.toml": ["pnpm run taplo:cmd"],
  "package.json": [
    "pnpm run sherif:cmd",
    "pnpm run npm-package-json:lint",
    "pnpm run sort-package-json:fix",
    "pnpm run biome:fix",
  ],
  "thunder-tests/**/*.json": ["./scripts/check_thunder_url.sh"],
};
