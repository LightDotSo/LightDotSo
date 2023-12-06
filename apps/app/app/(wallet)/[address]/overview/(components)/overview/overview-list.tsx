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

"use client";

import { AnimatePresence, Reorder } from "framer-motion";
import { useState, type FC } from "react";
import type { Address } from "viem";
import { OverviewCard } from "@/app/(wallet)/[address]/overview/(components)/overview/overview-card";
import { OverviewWrapper } from "@/app/(wallet)/[address]/overview/(components)/overview/overview-wrapper";
import { OVERVIEW_NAV_ITEMS } from "@/app/(wallet)/[address]/overview/(const)/nav-items";
import { NftsList } from "@/components/nft/nfts-list";
import { TokensList } from "@/components/token/tokens-list";
import { OverviewSubCategory, TITLES } from "@/const/titles";

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const initialItems = Object.keys(TITLES.Overview.subcategories).filter(
  key => key !== OverviewSubCategory.All,
);

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type OverviewListProps = {
  address: Address;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const OverviewList: FC<OverviewListProps> = ({ address }) => {
  const [items, setItems] = useState(initialItems);

  const itemToComponent = (itemId: string): JSX.Element => {
    switch (itemId) {
      case OverviewSubCategory.Tokens:
        return <TokensList address={address} limit={4} />;
      case OverviewSubCategory.NFTs:
        return <NftsList address={address} limit={6} />;
      case OverviewSubCategory.History:
        return <TokensList address={address} />;
      default:
        return <></>;
    }
  };

  return (
    <OverviewWrapper>
      <Reorder.Group
        className="relative flex flex-col space-y-6"
        axis="y"
        values={items}
        onReorder={setItems}
      >
        <AnimatePresence>
          {items.map(item => (
            <OverviewCard
              key={item}
              href={`/${address}${
                OVERVIEW_NAV_ITEMS.find(nav => nav.category === item)?.href ??
                ""
              }`}
              value={item}
              title={TITLES.Overview.subcategories[item]?.title}
            >
              {itemToComponent(item)}
            </OverviewCard>
          ))}
        </AnimatePresence>
      </Reorder.Group>
    </OverviewWrapper>
  );
};
