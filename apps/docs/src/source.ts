import { allDocs, allMetas } from "content-collections";
import { loader } from "fumadocs-core/source";
import { createMDXSource } from "@fumadocs/content-collections";

export const { getPage, getPages, pageTree } = loader({
  source: createMDXSource(allDocs, allMetas),
});
