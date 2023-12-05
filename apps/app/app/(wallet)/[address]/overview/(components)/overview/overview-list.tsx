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
import { TokensList } from "@/components/token/tokens-list";

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const initialItems = ["token", "nft", "transaction"];

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
      case "token":
        return <TokensList address={address} />;
      case "nft":
        return <TokensList address={address} />;
      case "transaction":
        return <TokensList address={address} />;
      default:
        return <></>;
    }
  };

  return (
    <OverviewWrapper>
      <Reorder.Group
        className="relative flex flex-col space-y-4"
        axis="y"
        values={items}
        onReorder={setItems}
      >
        <AnimatePresence>
          {items.map(item => (
            <OverviewCard key={item} value={item}>
              {itemToComponent(item)}
            </OverviewCard>
          ))}
        </AnimatePresence>
      </Reorder.Group>
    </OverviewWrapper>
  );
};
