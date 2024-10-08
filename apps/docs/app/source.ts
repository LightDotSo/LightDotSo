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

import { docs, meta } from "@/.source";
import { loader } from "fumadocs-core/source";
import { createMDXSource } from "fumadocs-mdx";
import { attachFile, createOpenAPI } from "fumadocs-openapi/server";

// -----------------------------------------------------------------------------
// Source
// -----------------------------------------------------------------------------

export const source = loader({
  baseUrl: "/",
  source: createMDXSource(docs, meta),
  pageTree: {
    attachFile,
  },
  // url: (slugs, _locale) => {
  //   // Prefix /docs/ if in production
  //   return process.env.VERCEL_ENV === "production"
  //     ? `/docs/${slugs.length === 0 ? "" : slugs.join("/")}`
  //     : slugs.length === 0
  //       ? "/"
  //       : `/${slugs.join("/")}`;
  // },
});

// -----------------------------------------------------------------------------
// Open API
// -----------------------------------------------------------------------------

export const openapi = createOpenAPI();
