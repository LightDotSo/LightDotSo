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

import {
  BaseLayerWrapper,
  MiddleLayerWrapper,
  BasicPageWrapper,
  BannerSection,
  HStackFull,
  MinimalPageWrapper,
} from "@lightdotso/ui";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ActivityDataTableToolbar } from "@/app/(wallet)/[address]/activity/(components)/activity-data-table-toolbar";
import { verifyUserId } from "@/auth";
import { TITLES } from "@/const";

// -----------------------------------------------------------------------------
// Metadata
// -----------------------------------------------------------------------------

export const metadata: Metadata = {
  title: TITLES.Activity.title,
  description: TITLES.Activity.description,
};

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface ActivityLayoutProps {
  children: ReactNode;
}

// -----------------------------------------------------------------------------
// Layout
// -----------------------------------------------------------------------------

export default async function ActivityLayout({
  children,
}: ActivityLayoutProps) {
  // ---------------------------------------------------------------------------
  // Auth
  // ---------------------------------------------------------------------------

  const userId = await verifyUserId();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!userId) {
    return (
      <BannerSection
        title={TITLES.Activity.title}
        description={TITLES.Activity.description}
      >
        <HStackFull>
          <BaseLayerWrapper>
            <MinimalPageWrapper>{children}</MinimalPageWrapper>
          </BaseLayerWrapper>
        </HStackFull>
      </BannerSection>
    );
  }

  return (
    <>
      <BannerSection
        title={TITLES.Activity.title}
        description={TITLES.Activity.description}
      >
        <MiddleLayerWrapper>
          <ActivityDataTableToolbar />
        </MiddleLayerWrapper>
      </BannerSection>
      <BaseLayerWrapper>
        <BasicPageWrapper>{children}</BasicPageWrapper>
      </BaseLayerWrapper>
    </>
  );
}

// -----------------------------------------------------------------------------
// Data
// -----------------------------------------------------------------------------

export const experimental_ppr = false;
export const revalidate = 300;
