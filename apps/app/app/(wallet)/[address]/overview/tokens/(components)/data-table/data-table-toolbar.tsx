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

import type { TokenData } from "@lightdotso/data";
import { usePaginationQueryState } from "@lightdotso/nuqs";
import { useQueryTokens, useQueryWalletSettings } from "@lightdotso/query";
import { useAuth, useTables } from "@lightdotso/stores";
import {
  DataTableFacetedFilter,
  DataTableViewOptions,
} from "@lightdotso/templates/data-table";
import { Button } from "@lightdotso/ui/components/button";
import { Skeleton } from "@lightdotso/ui/components/skeleton";
import { getChainNameWithChainId } from "@lightdotso/utils";
import { Cross2Icon } from "@radix-ui/react-icons";
import type { Table } from "@tanstack/react-table";
import { useMemo } from "react";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface DataTableToolbarProps {
  table: Table<TokenData>;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function DataTableToolbar({ table }: DataTableToolbarProps) {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { wallet } = useAuth();
  const { tokenColumnFilters } = useTables();

  // ---------------------------------------------------------------------------
  // Query State Hooks
  // ---------------------------------------------------------------------------

  const [paginationState] = usePaginationQueryState();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const offsetCount = useMemo(() => {
    return paginationState.pageSize * paginationState.pageIndex;
  }, [paginationState.pageSize, paginationState.pageIndex]);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { walletSettings } = useQueryWalletSettings({
    address: wallet as Address,
  });

  const { tokens } = useQueryTokens({
    address: wallet as Address,
    // biome-ignore lint/style/useNamingConvention: <explanation>
    is_testnet: walletSettings?.is_enabled_testnet ?? false,
    limit: paginationState.pageSize,
    offset: offsetCount,
    group: true,
    // biome-ignore lint/style/useNamingConvention: <explanation>
    chain_ids: null,
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const uniqueChainIdValues = useMemo(() => {
    // Get all unique weight values from current data
    const uniqueChainIdValues = new Set<number>();
    // biome-ignore lint/complexity/noForEach: <explanation>
    tokens?.forEach((token) => {
      uniqueChainIdValues.add(token.chain_id);
      if (token.group?.tokens) {
        // biome-ignore lint/complexity/noForEach: <explanation>
        token.group.tokens.forEach((token) => {
          uniqueChainIdValues.add(token.chain_id);
        });
      }
    });
    return uniqueChainIdValues;
  }, [tokens]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (
    !table ||
    typeof table.getColumn !== "function" ||
    typeof table.resetColumnFilters !== "function"
  ) {
    return null;
  }

  return (
    <>
      <div className="flex flex-1 items-center space-x-2">
        {table?.getColumn("chain_id") && (
          <DataTableFacetedFilter
            column={table?.getColumn("chain_id")}
            title="Chain"
            options={Array.from(uniqueChainIdValues).map((i) => ({
              value: i.toString(),
              label: getChainNameWithChainId(i),
            }))}
          />
        )}
        {tokenColumnFilters.length > 0 && (
          <Button
            variant="outline"
            className="h-8 px-2 lg:px-3"
            onClick={() => table?.resetColumnFilters()}
          >
            Reset
            <Cross2Icon className="ml-2 size-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions
        table={table}
        columnMapping={{
          name: "Chain",
          // biome-ignore lint/style/useNamingConvention: <explanation>
          balance_usd: "Balance",
          // biome-ignore lint/style/useNamingConvention: <explanation>
          chain_id: "Chain",
          sparkline: "Last 7 Days",
          price: "Price",
          actions: "Actions",
        }}
      />
    </>
  );
}

// -----------------------------------------------------------------------------
// Skeleton
// -----------------------------------------------------------------------------

export function DataTableToolbarSkeleton() {
  return (
    <>
      <div className="flex flex-1 items-center space-x-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
    </>
  );
}
