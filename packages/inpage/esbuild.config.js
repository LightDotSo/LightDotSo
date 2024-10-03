// Copyright 2023-2024 LightDotSo.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const { build } = require("esbuild");
require("dotenv").config();

const commonOptions = {
  entryPoints: ["./src/inpage.ts"],
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
].map((specificOptions) => ({ ...commonOptions, ...specificOptions }));

Promise.all(options.map((option) => build(option))).catch(() => {
  return process.exit(1);
});
