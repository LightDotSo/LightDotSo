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

import { WalletOverviewBannerSkeleton } from "@/app/(wallet)/[address]/overview/(components)/wallet-overview-banner/wallet-overview-banner";
import { OVERVIEW_NAV_TABS } from "@/app/(wallet)/[address]/overview/(const)/nav-tabs";
import { LinkButtonGroup } from "@/components/section/link-button-group";
import { TITLES } from "@/const";
import { InvokeButtonSkeleton } from "@lightdotso/elements/invoke-button";
import {
  BaseLayerWrapper,
  LargeLayerWrapper,
  MiddleLayerWrapper,
  MinimalPageWrapper,
} from "@lightdotso/ui/wrappers";
import type { Metadata } from "next";

// -----------------------------------------------------------------------------
// Metadata
// -----------------------------------------------------------------------------

export const metadata: Metadata = {
  title: TITLES.Overview.title,
  description: TITLES.Overview.description,
};

// -----------------------------------------------------------------------------
// Layout
// -----------------------------------------------------------------------------

export function Loading() {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      <LargeLayerWrapper>
        <WalletOverviewBannerSkeleton />
      </LargeLayerWrapper>
      <MiddleLayerWrapper>
        <LinkButtonGroup tabs={OVERVIEW_NAV_TABS}>
          <InvokeButtonSkeleton />
        </LinkButtonGroup>
      </MiddleLayerWrapper>
      <BaseLayerWrapper>
        <MinimalPageWrapper>
          {/* biome-ignore lint/complexity/noUselessFragments: <explanation> */}
          <></>
        </MinimalPageWrapper>
      </BaseLayerWrapper>
    </>
  );
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

// biome-ignore lint/style/noDefaultExport: <explanation>
export default Loading;
