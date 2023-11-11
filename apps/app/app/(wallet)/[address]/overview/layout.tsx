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

import { LinkButtonGroup } from "@/components/link-button-group";
import { WalletOverviewBanner } from "@/app/(wallet)/[address]/overview/(components)/WalletOverviewBanner";
import { InvokePortfolioButton } from "@/app/(wallet)/[address]/overview/(components)/InvokePortfolioButton";
import type { Address } from "viem";

const overviewNavItems = [
  {
    title: "Token",
    href: "/overview",
    id: "overview",
  },
  {
    title: "NFT",
    href: "/overview/nft",
    id: "nft",
  },
  {
    title: "History",
    href: "/overview/history",
    id: "history",
  },
];

export default function OverviewLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    address: string;
  };
}) {
  return (
    <>
      <div className="flex w-full flex-col space-y-8 border-b border-input sm:flex-row sm:space-x-12 sm:space-y-0">
        <div className="max-w-7xl flex-1 space-y-8 px-2 py-12 sm:mx-auto md:px-4 md:py-16 lg:px-0">
          <WalletOverviewBanner address={params.address as Address} />
        </div>
      </div>
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <div className="mx-auto max-w-7xl flex-1 space-y-8">
          <LinkButtonGroup items={overviewNavItems}>
            <InvokePortfolioButton address={params.address as Address} />
          </LinkButtonGroup>
          {children}
        </div>
      </div>
    </>
  );
}
