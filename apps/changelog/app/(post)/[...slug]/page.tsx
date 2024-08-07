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

import "@lightdotso/styles/keystatic.css";
import { createReader } from "@keystatic/core/reader";
import {
  BannerSection,
  BaseLayerWrapper,
  BasicPageWrapper,
  HStackFull,
  minimalHeightWrapper,
} from "@lightdotso/ui";
import Markdoc from "@markdoc/markdoc";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";
import keystaticConfig from "~/keystatic.config";

// -----------------------------------------------------------------------------
// Reader
// -----------------------------------------------------------------------------

const reader = createReader(process.cwd(), keystaticConfig);

// -----------------------------------------------------------------------------
// Metadata
// -----------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: { slug: string[] };
}): Promise<Metadata> {
  // ---------------------------------------------------------------------------
  // Reader
  // ---------------------------------------------------------------------------

  const changelog = await reader.collections.posts.read(params.slug.join("/"));
  if (!changelog) {
    return notFound();
  }

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    title: changelog.title,
    openGraph: {
      images: changelog.ogp.src,
    },
  };
}

// -----------------------------------------------------------------------------
// Generate
// -----------------------------------------------------------------------------

export async function generateStaticParams() {
  const changelogs = await reader.collections.posts.all();

  return changelogs.map((changelog) => ({
    slug: changelog.slug.split("/"),
  }));
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function Page({ params }: { params: { slug: string[] } }) {
  // ---------------------------------------------------------------------------
  // Reader
  // ---------------------------------------------------------------------------

  const changelog = await reader.collections.posts.read(params.slug.join("/"));
  if (!changelog) {
    return notFound();
  }

  // ---------------------------------------------------------------------------
  // Markdoc
  // ---------------------------------------------------------------------------

  const { node } = await changelog.content();
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
    <BannerSection
      size="xs"
      title={`Changelog #${changelog.issue} - ${changelog.title}`}
    >
      <HStackFull>
        <BaseLayerWrapper size="xs">
          <BasicPageWrapper className={minimalHeightWrapper}>
            <div className="keystatic">
              {Markdoc.renderers.react(renderable, React)}
            </div>
          </BasicPageWrapper>
        </BaseLayerWrapper>
      </HStackFull>
    </BannerSection>
  );
}
