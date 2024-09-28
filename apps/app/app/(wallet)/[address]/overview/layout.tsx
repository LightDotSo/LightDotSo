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

import { OverviewInvokeButton } from "@/app/(wallet)/[address]/overview/(components)/overview/overview-invoke-button";
import { WalletOverviewBanner } from "@/app/(wallet)/[address]/overview/(components)/wallet-overview-banner/wallet-overview-banner";
import { OVERVIEW_NAV_ITEMS } from "@/app/(wallet)/[address]/overview/(const)/nav-items";
import { LinkButtonGroup } from "@/components/section/link-button-group";
import { TITLES } from "@/const";
import {
  BaseLayerWrapper,
  LargeLayerWrapper,
  MiddleLayerWrapper,
  MinimalPageWrapper,
} from "@lightdotso/ui/wrappers";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Metadata
// -----------------------------------------------------------------------------

export const metadata: Metadata = {
  title: TITLES.Overview.title,
  description: TITLES.Overview.description,
};

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type OverviewLayoutProps = {
  children: ReactNode;
  nav: ReactNode;
  params: Promise<{
    address: string;
    isDemo?: boolean;
  }>;
};

// -----------------------------------------------------------------------------
// Layout
// -----------------------------------------------------------------------------

export default async function OverviewLayout({
  children,
  nav,
  params,
}: OverviewLayoutProps) {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      <LargeLayerWrapper>
        <WalletOverviewBanner
          address={(await params).address as Address}
          isDemo={(await params).isDemo}
        />
      </LargeLayerWrapper>
      <MiddleLayerWrapper>
        <LinkButtonGroup items={OVERVIEW_NAV_ITEMS}>
          {nav}
          <OverviewInvokeButton address={(await params).address as Address} />
        </LinkButtonGroup>
      </MiddleLayerWrapper>
      <BaseLayerWrapper>
        <MinimalPageWrapper>{children}</MinimalPageWrapper>
      </BaseLayerWrapper>
    </>
  );
}

// -----------------------------------------------------------------------------
// Data
// -----------------------------------------------------------------------------

export const revalidate = 300;
