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

import type { Metadata } from "next";
import type { Address } from "viem";
import { InvokePortfolioButton } from "@/app/(wallet)/[address]/overview/(components)/invoke-portfolio-button";
import { WalletOverviewBanner } from "@/app/(wallet)/[address]/overview/(components)/wallet-overview-banner/wallet-overview-banner";
import { OVERVIEW_NAV_ITEMS } from "@/app/(wallet)/[address]/overview/(const)/nav-items";
import { LinkButtonGroup } from "@/components/section/link-button-group";
import { BaseLayerWrapper } from "@/components/wrapper/layer/base-layer-wrapper";
import { LargeLayerWrapper } from "@/components/wrapper/layer/large-layer-wrapper";
import { MiddleLayerWrapper } from "@/components/wrapper/layer/middle-layer-wrapper";
import { MinimalPageWrapper } from "@/components/wrapper/page/minimal-page-wrapper";
import { TITLES } from "@/const/titles";

// -----------------------------------------------------------------------------
// Metadata
// -----------------------------------------------------------------------------

export const metadata: Metadata = {
  title: TITLES.Overview.subcategories.All.title,
  description: TITLES.Overview.subcategories.All.description,
};

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type OverviewLayoutProps = {
  children: React.ReactNode;
  nav: React.ReactNode;
  params: {
    address: string;
  };
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function OverviewLayout({
  children,
  nav,
  params,
}: OverviewLayoutProps) {
  return (
    <>
      <LargeLayerWrapper>
        <WalletOverviewBanner address={params.address as Address} />
      </LargeLayerWrapper>
      <MiddleLayerWrapper>
        <LinkButtonGroup items={OVERVIEW_NAV_ITEMS}>
          {nav}
          <InvokePortfolioButton address={params.address as Address} />
        </LinkButtonGroup>
      </MiddleLayerWrapper>
      <BaseLayerWrapper>
        <MinimalPageWrapper>{children}</MinimalPageWrapper>
      </BaseLayerWrapper>
    </>
  );
}
