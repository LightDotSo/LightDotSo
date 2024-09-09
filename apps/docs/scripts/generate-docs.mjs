// biome-ignore lint/style/noNamespaceImport: <explanation>
import * as openApi from "fumadocs-openapi";
import { rimrafSync } from "rimraf";

rimrafSync("./content/docs/(api)", {
  filter(v) {
    // biome-ignore lint/complexity/useSimplifiedLogicExpression: <explanation>
    return !v.endsWith("index.mdx") && !v.endsWith("meta.json");
  },
});

// biome-ignore lint/complexity/noVoid: <explanation>
void openApi.generateFiles({
  input: ["https://api.light.so/api-docs/openapi.json"],
  output: "./content/(api)",
  per: "operation",
  groupBy: "tag",
});
