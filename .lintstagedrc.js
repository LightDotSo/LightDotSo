module.exports = {
  "*.{js,ts,tsx}": ["pnpm run eslint:cmd --fix"],
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
};
