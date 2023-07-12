module.exports = {
  "*.{js,ts,tsx}": ["yarn run eslint:cmd --fix"],
  "*.{md,json,yml}": ["yarn run prettier:cmd --write"],
  "*.sol": [
    "yarn run forge:fmt:cmd",
    "yarn run forge:snapshot:cmd",
    "yarn run solhint:cmd --fix",
  ],
  "package.json": [
    "pnpm run npm-package-json:lint",
    "pnpm run sort-package-json:fix",
  ],
};
