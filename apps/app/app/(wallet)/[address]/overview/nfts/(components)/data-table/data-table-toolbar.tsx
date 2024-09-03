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

import { SIMPLEHASH_MAX_COUNT } from "@lightdotso/const";
import type { NftData } from "@lightdotso/data";
import { useQueryNfts, useQueryWalletSettings } from "@lightdotso/query";
import { useAuth, useTables } from "@lightdotso/stores";
import {
  DataTableFacetedFilter,
  DataTableViewOptions,
} from "@lightdotso/templates/data-table";
import { Button } from "@lightdotso/ui/components/button";
import { Cross2Icon } from "@radix-ui/react-icons";
import type { Table } from "@tanstack/react-table";
import { useMemo } from "react";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface DataTableToolbarProps {
  table: Table<NftData>;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function DataTableToolbar({ table }: DataTableToolbarProps) {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { wallet } = useAuth();
  const { nftColumnFilters } = useTables();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { walletSettings } = useQueryWalletSettings({
    address: wallet as Address,
  });

  const { nftPage } = useQueryNfts({
    address: wallet as Address,
    // biome-ignore lint/style/useNamingConvention: <explanation>
    is_testnet: walletSettings?.is_enabled_testnet ?? false,
    limit: SIMPLEHASH_MAX_COUNT,
    cursor: null,
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const uniqueChainValues = useMemo(() => {
    // Get all unique weight values from current data
    const uniqueChainValues = new Set<string>();
    // biome-ignore lint/complexity/noForEach: <explanation>
    nftPage?.nfts?.forEach((nft) => {
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      uniqueChainValues.add(nft.chain!);
    });
    return uniqueChainValues;
  }, [nftPage]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!table) {
    return null;
  }

  return (
    <>
      <div className="flex flex-1 items-center space-x-2">
        {table?.getColumn("chain") && (
          <DataTableFacetedFilter
            column={table?.getColumn("chain")}
            title="Chain"
            options={Array.from(uniqueChainValues).map((chain) => ({
              value: chain,
              label: chain,
            }))}
          />
        )}
        {table?.getColumn("spam_score") && (
          <DataTableFacetedFilter
            column={table?.getColumn("spam_score")}
            title="Spam"
            options={["Yes", "No"].map((value) => ({
              value: value === "No" ? "0" : "70",
              label: value,
            }))}
          />
        )}
        {nftColumnFilters.length > 0 && (
          <Button
            variant="outline"
            className="h-8 px-2 lg:px-3"
            onClick={() => table.resetColumnFilters()}
          >
            Reset
            <Cross2Icon className="ml-2 size-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions
        table={table}
        columnMapping={{
          chain: "Chain",
          name: "Name",
          description: "Description",
          // biome-ignore lint/style/useNamingConvention: <explanation>
          spam_score: "Spam Score",
        }}
      />
    </>
  );
}
