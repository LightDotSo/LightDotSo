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
import { OVERVIEW_NAV_TABS } from "@/app/(wallet)/[address]/overview/(const)/nav-tabs";
import { OverviewSubCategory, TITLES } from "@/const";
import { OVERVIEW_ROW_COUNT } from "@lightdotso/const";
import { NftTable } from "@lightdotso/tables/nft";
import { nftColumns } from "@lightdotso/tables/nft";
import { TokenTable } from "@lightdotso/tables/token";
import { tokenColumns } from "@lightdotso/tables/token";
import {
  TransactionTable,
  transactionColumns,
} from "@lightdotso/tables/transaction";
import { Skeleton } from "@lightdotso/ui/components/skeleton";
import dynamic from "next/dynamic";
import type { FC, JSX } from "react";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Skeleton
// -----------------------------------------------------------------------------

const OverviewListItemSkeleton = () => <Skeleton className="h-64 w-full" />;

const OverviewListPortfolioSkeleton = () => <Skeleton className="h-6 w-16" />;

// -----------------------------------------------------------------------------
// Dynamic
// -----------------------------------------------------------------------------

const TokensList = dynamic(
  () =>
    import("@/components/token/tokens-list").then((mod) => ({
      default: mod.TokensList,
    })),
  {
    loading: () => <OverviewListItemSkeleton />,
    ssr: false,
  },
);

const TokenPortfolio = dynamic(
  () =>
    import("@/components/token/token-portfolio").then((mod) => ({
      default: mod.TokenPortfolio,
    })),
  {
    loading: () => <OverviewListPortfolioSkeleton />,
    ssr: false,
  },
);

const NftsList = dynamic(
  () =>
    import("@/components/nft/nfts-list").then((mod) => ({
      default: mod.NftsList,
    })),
  {
    loading: () => <OverviewListItemSkeleton />,
    ssr: false,
  },
);

const NftPortfolio = dynamic(
  () =>
    import("@/components/nft/nft-portfolio").then((mod) => ({
      default: mod.NftPortfolio,
    })),
  {
    loading: () => <OverviewListPortfolioSkeleton />,
    ssr: false,
  },
);

const TransactionsList = dynamic(
  () =>
    import("@/components/transaction/transactions-list").then((mod) => ({
      default: mod.TransactionsList,
    })),
  {
    loading: () => <OverviewListItemSkeleton />,
    ssr: false,
  },
);

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const initialItems = Object.keys(TITLES.Overview.subcategories).filter(
  (key) => key !== OverviewSubCategory.All,
);

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type OverviewListProps = {
  address: Address | null;
  isDemo?: boolean;
  isLoading?: boolean;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const OverviewList: FC<OverviewListProps> = ({
  address,
  isDemo = false,
  isLoading = false,
}) => {
  // ---------------------------------------------------------------------------
  // Component Mapping
  // ---------------------------------------------------------------------------

  const itemToComponent = (itemId: string): JSX.Element => {
    if (isLoading || !address) {
      switch (itemId) {
        case OverviewSubCategory.Tokens:
          return (
            <TokenTable
              isLoading
              pageSize={OVERVIEW_ROW_COUNT}
              data={[]}
              columns={tokenColumns}
            />
          );
        case OverviewSubCategory.NFTs:
          return (
            <NftTable
              isLoading
              pageSize={OVERVIEW_ROW_COUNT}
              limit={OVERVIEW_ROW_COUNT}
              data={[]}
              columns={nftColumns}
            />
          );
        case OverviewSubCategory.History:
          return (
            <TransactionTable
              isLoading
              pageSize={OVERVIEW_ROW_COUNT}
              data={[]}
              columns={transactionColumns}
            />
          );
        default:
          return <></>;
      }
    }

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
        return <></>;
    }
  };

  const itemToNav = (itemId: string): JSX.Element => {
    if (isLoading || !address) {
      return <OverviewListPortfolioSkeleton />;
    }

    switch (itemId) {
      case OverviewSubCategory.Tokens:
        return <TokenPortfolio isNeutral address={address} size="balance" />;
      case OverviewSubCategory.NFTs:
        return <NftPortfolio isNeutral address={address} size="balance" />;
      default:
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
            OVERVIEW_NAV_TABS.find((nav) => nav.category === item)?.href ?? ""
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
