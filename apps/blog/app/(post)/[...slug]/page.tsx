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
import { ExternalLink, NextImage } from "@lightdotso/elements";
import {
  BannerSection,
  BaseLayerWrapper,
  BasicPageWrapper,
  HStackFull,
} from "@lightdotso/ui";
import { refineDateFormat } from "@lightdotso/utils";
import { bundleMDX } from "mdx-bundler";
import { getMDXComponent } from "mdx-bundler/client";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
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

  const blog = await reader.collections.posts.read(params.slug.join("/"));
  if (!blog) {
    return notFound();
  }

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    title: blog.title,
    openGraph: {
      images: blog.ogp.src,
    },
  };
}

// -----------------------------------------------------------------------------
// Generate
// -----------------------------------------------------------------------------

export async function generateStaticParams() {
  const blogs = await reader.collections.posts.all();

  return blogs.map((blog) => ({
    slug: blog.slug.split("/"),
  }));
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function Page({ params }: { params: { slug: string[] } }) {
  // ---------------------------------------------------------------------------
  // Reader
  // ---------------------------------------------------------------------------

  const blog = await reader.collections.posts.read(params.slug.join("/"), {
    resolveLinkedFiles: true,
  });
  if (!blog) {
    return notFound();
  }

  // ---------------------------------------------------------------------------
  // MDX
  // ---------------------------------------------------------------------------

  const { code } = await bundleMDX({
    source: blog.content,
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <BannerSection
      size="ss"
      title={blog.title}
      description={`Published on ${refineDateFormat(new Date(blog.date))}`}
    >
      <HStackFull>
        <BaseLayerWrapper size="ss">
          <BasicPageWrapper>
            <div className="keystatic">
              {getMDXComponent(code)({
                components: { a: ExternalLink, Image: NextImage },
              })}
            </div>
          </BasicPageWrapper>
        </BaseLayerWrapper>
      </HStackFull>
    </BannerSection>
  );
}
