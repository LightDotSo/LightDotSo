import { glob } from "glob";
import _ from "lodash";
import { build } from "tsup";

// Tracking: https://github.com/egoist/tsup/issues/920

// From: https://github.com/tigawanna/shadcn-ui-fanedition/blob/2230af460811a06f1fe6ba70e8059cf23149a9c5/packages/ui/scripts/tsup-build-stages.ts
// License: MIT

const isProduction = process.env.NODE_ENV === "production";

// @ts-ignore
async function buildStage({ entry }) {
  try {
    await build({
      clean: false,
      dts: true,
      treeshake: true,
      splitting: true,
      outDir: "dist",
      entry,
      format: ["cjs", "esm"],
      external: ["react", "react-dom"],
      minify: isProduction,
      sourcemap: true,
    });
  } catch (err) {
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.error(err);
    throw err;
  }
}

export async function buildAllStages() {
  const files = glob.sync("src/*/index.ts");
  const chunkSize = 3;
  const chunks = _.chunk(files, chunkSize);
  // await buildStage({ clean:true, entry: chunks[0] });
  for await (const [_, chunk] of chunks.entries()) {
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.info("🚀 ~ chunk === ", chunk);
    await buildStage({ entry: chunk });
  }
  //    await buildStage({ clean:true, entry: root_file });
}

export function invokeBuild() {
  buildAllStages()
    .then(() => {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.info("🚀 ~ buildAllStages success");
    })
    .catch((err) => {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.error("🚀 ~ buildAllStages error === ", err);
    });
}
invokeBuild();
