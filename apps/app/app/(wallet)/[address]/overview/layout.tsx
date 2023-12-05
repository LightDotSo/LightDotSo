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
  params: {
    address: string;
  };
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function OverviewLayout({
  children,
  params,
}: OverviewLayoutProps) {
  return (
    <>
      <div className="flex w-full flex-col space-y-8 border-b border-b-border sm:flex-row sm:space-x-12 sm:space-y-0">
        <div className="max-w-7xl flex-1 space-y-8 px-2 py-6 sm:mx-auto md:px-4 lg:px-0">
          <WalletOverviewBanner address={params.address as Address} />
        </div>
      </div>
      <div className="flex w-full flex-row border-b border-border py-4">
        <div className="mx-auto max-w-7xl flex-1">
          <LinkButtonGroup items={OVERVIEW_NAV_ITEMS}>
            <InvokePortfolioButton address={params.address as Address} />
          </LinkButtonGroup>
        </div>
      </div>
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <div className="mx-auto max-w-7xl flex-1 space-y-8 py-6">
          {children}
        </div>
      </div>
    </>
  );
}
