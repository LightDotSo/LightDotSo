const { build } = require("esbuild");
require("dotenv").config();

const commonOptions = {
  entryPoints: ["./src/background.ts"],
  tsconfig: "tsconfig.json",
  bundle: true,
  minify: true,
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
  },
};

const options = [
  {
    outdir: "../../ios/LightWalletSafariExtension/Resources",
  },
  {
    outdir: "../../apps/extension/chrome",
  },
  {
    outdir: "../../apps/extension/firefox",
  },
].map(specificOptions => ({ ...commonOptions, ...specificOptions }));

Promise.all(options.map(option => build(option))).catch(() => {
  return process.exit(1);
});
