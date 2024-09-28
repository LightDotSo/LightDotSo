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
import { toThreeDigits } from "@/utils";
import { createReader } from "@keystatic/core/reader";
import { ExternalLink } from "@lightdotso/elements/external-link";
import { NextImage } from "@lightdotso/elements/next-image";
import { BannerSection } from "@lightdotso/ui/sections";
import { HStackFull } from "@lightdotso/ui/stacks";
import {
  BaseLayerWrapper,
  BasicPageWrapper,
  minimalHeightWrapper,
} from "@lightdotso/ui/wrappers";
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
// Props
// -----------------------------------------------------------------------------

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

async function fetchChangelog(params: { slug: string[] }) {
  const issueNumber = params.slug[0];
  const parsedIssueNumber = Number.parseInt(issueNumber, 10);
  const changelogs = await reader.collections.posts.all();
  const issueMaybeChangelog = changelogs.find(
    (c) => c.entry.issue === parsedIssueNumber,
  );

  return issueMaybeChangelog
    ? await reader.collections.posts.read(issueMaybeChangelog.slug, {
        resolveLinkedFiles: true,
      })
    : await reader.collections.posts.read(params.slug.join("/"), {
        resolveLinkedFiles: true,
      });
}

// -----------------------------------------------------------------------------
// Metadata
// -----------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  // ---------------------------------------------------------------------------
  // Reader
  // ---------------------------------------------------------------------------

  const changelog = await fetchChangelog(await params);

  if (!changelog) {
    return notFound();
  }

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    title: `#${toThreeDigits(changelog.issue)} - ${changelog.title}`,
    description: changelog.description,
    openGraph: {
      images: changelog.ogp.src,
    },
    twitter: {
      images: changelog.ogp.src,
    },
  };
}

// -----------------------------------------------------------------------------
// Generate
// -----------------------------------------------------------------------------

export async function generateStaticParams() {
  const changelogs = await reader.collections.posts.all();

  return changelogs
    .map((changelog) => ({
      slug: changelog.slug.split("/"),
    }))
    .concat(
      changelogs.map((changelog) => ({
        slug: changelog.entry.issue.toString().split("/"),
      })),
    )
    .concat(
      changelogs.map((changelog) => ({
        slug: toThreeDigits(changelog.entry.issue).split("/"),
      })),
    );
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function Page({ params }: PageProps) {
  // ---------------------------------------------------------------------------
  // Reader
  // ---------------------------------------------------------------------------

  const changelog = await fetchChangelog(await params);

  if (!changelog) {
    return notFound();
  }

  // ---------------------------------------------------------------------------
  // MDX
  // ---------------------------------------------------------------------------

  const { code } = await bundleMDX({
    source: changelog.content,
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <BannerSection
      size="xs"
      title={`Changelog #${toThreeDigits(changelog.issue)} - ${changelog.title}`}
      description={changelog.description}
    >
      <HStackFull>
        <BaseLayerWrapper size="xs">
          <BasicPageWrapper className={minimalHeightWrapper}>
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
