// Copyright 2023-2024 Light, Inc.
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

import { createReader } from "@keystatic/core/reader";
import Markdoc from "@markdoc/markdoc";
import React from "react";
import { notFound } from "next/navigation";
import keystaticConfig from "~/keystatic.config";

// -----------------------------------------------------------------------------
// Reader
// -----------------------------------------------------------------------------

const reader = createReader(process.cwd(), keystaticConfig);

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function Page({ params }: { params: { slug: string } }) {
  // ---------------------------------------------------------------------------
  // Reader
  // ---------------------------------------------------------------------------

  const proposal = await reader.collections.proposals.read(params.slug);
  if (!proposal) {
    return notFound();
  }

  // ---------------------------------------------------------------------------
  // Markdoc
  // ---------------------------------------------------------------------------

  const { node } = await proposal.content();
  const errors = Markdoc.validate(node);
  if (errors.length) {
    console.error(errors);
    throw new Error("Invalid content");
  }
  const renderable = Markdoc.transform(node);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      <h1>{proposal.title}</h1>
      {Markdoc.renderers.react(renderable, React)}
      <hr />
      <a href={`/`}>Back to Proposals</a>
    </>
  );
}
