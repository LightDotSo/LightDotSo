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

"use client";

import { OverviewCard } from "@/app/(wallet)/[address]/overview/(components)/overview/overview-card";
import { OVERVIEW_NAV_ITEMS } from "@/app/(wallet)/[address]/overview/(const)/nav-items";
import { OverviewSubCategory, TITLES } from "@/const";
import { OVERVIEW_ROW_COUNT } from "@lightdotso/const";
import { Skeleton } from "@lightdotso/ui";
import dynamic from "next/dynamic";
import type { FC } from "react";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Skeleton
// -----------------------------------------------------------------------------

const OverviewListItemSkeleton = () => <Skeleton className="h-64 w-full" />;

const OverviewListPortfolioSkeleton = () => <Skeleton className="h-4 w-8" />;

// -----------------------------------------------------------------------------
// Dynamic
// -----------------------------------------------------------------------------

const TokensList = dynamic(
  () => import("@/components/token/tokens-list").then((mod) => mod.TokensList),
  {
    loading: () => <OverviewListItemSkeleton />,
    ssr: false,
  },
);

const TokenPortfolio = dynamic(
  () =>
    import("@/components/token/token-portfolio").then(
      (mod) => mod.TokenPortfolio,
    ),
  {
    loading: () => <OverviewListPortfolioSkeleton />,
    ssr: false,
  },
);

const NftsList = dynamic(
  () => import("@/components/nft/nfts-list").then((mod) => mod.NftsList),
  {
    loading: () => <OverviewListItemSkeleton />,
    ssr: false,
  },
);

const NftPortfolio = dynamic(
  () =>
    import("@/components/nft/nft-portfolio").then((mod) => mod.NftPortfolio),
  {
    loading: () => <OverviewListPortfolioSkeleton />,
    ssr: false,
  },
);

const TransactionsList = dynamic(
  () =>
    import("@/components/transaction/transactions-list").then(
      (mod) => mod.TransactionsList,
    ),
  {
    loading: () => <OverviewListItemSkeleton />,
    ssr: false,
  },
);

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const initialItems = Object.keys(TITLES.Overview.subcategories).filter(
  (key) => key !== OverviewSubCategory.All,
);

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type OverviewListProps = {
  address: Address;
  isDemo?: boolean;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const OverviewList: FC<OverviewListProps> = ({
  address,
  isDemo = false,
}) => {
  // ---------------------------------------------------------------------------
  // Component Mapping
  // ---------------------------------------------------------------------------

  // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
  const itemToComponent = (itemId: string): JSX.Element => {
    switch (itemId) {
      case OverviewSubCategory.Tokens:
        return <TokensList address={address} limit={OVERVIEW_ROW_COUNT} />;
      case OverviewSubCategory.NFTs:
        return <NftsList address={address} limit={OVERVIEW_ROW_COUNT} />;
      case OverviewSubCategory.History:
        return (
          <TransactionsList address={address} limit={OVERVIEW_ROW_COUNT} />
        );
      default:
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <></>;
    }
  };

  // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
  const itemToNav = (itemId: string): JSX.Element => {
    switch (itemId) {
      case OverviewSubCategory.Tokens:
        return <TokenPortfolio isNeutral address={address} size="balance" />;
      case OverviewSubCategory.NFTs:
        return <NftPortfolio isNeutral address={address} size="balance" />;
      default:
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <></>;
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="relative flex flex-col space-y-6">
      {initialItems.map((item) => (
        <OverviewCard
          key={item}
          href={`/${isDemo ? "demo" : address}${
            OVERVIEW_NAV_ITEMS.find((nav) => nav.category === item)?.href ?? ""
          }`}
          title={TITLES.Overview.subcategories[item]?.title}
          nav={itemToNav(item)}
        >
          {itemToComponent(item)}
        </OverviewCard>
      ))}
    </div>
  );
};
