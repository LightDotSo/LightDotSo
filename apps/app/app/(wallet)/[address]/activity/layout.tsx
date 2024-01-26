// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

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
