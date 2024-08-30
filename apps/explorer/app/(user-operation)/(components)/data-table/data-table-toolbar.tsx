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

import type { UserOperationData } from "@lightdotso/data";
import {
  useIsTestnetQueryState,
  usePaginationQueryState,
} from "@lightdotso/nuqs";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth, useTables } from "@lightdotso/stores";
import {
  DataTableFacetedFilter,
  DataTableViewOptions,
} from "@lightdotso/templates/data-table";
import { Button, Label, Switch, ToolbarSectionWrapper } from "@lightdotso/ui";
import { getChainNameWithChainId } from "@lightdotso/utils";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useQueryClient } from "@tanstack/react-query";
import type { Table } from "@tanstack/react-table";
import { useMemo } from "react";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export interface DataTableToolbarProps {
  table: Table<UserOperationData>;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function DataTableToolbar({ table }: DataTableToolbarProps) {
  const { wallet } = useAuth();
  const { userOperationColumnFilters } = useTables();

  // ---------------------------------------------------------------------------
  // Query State Hooks
  // ---------------------------------------------------------------------------

  const [isTestnetState, setIsTestnetState] = useIsTestnetQueryState();
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

  const queryClient = useQueryClient();

  const currentData: UserOperationData[] | undefined = queryClient.getQueryData(
    queryKeys.user_operation.list({
      address: wallet as Address,
      status: "history",
      order: "asc",
      offset: offsetCount,
      limit: paginationState.pageSize,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      is_testnet: isTestnetState ?? false,
    }).queryKey,
  );

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const uniqueChainValues = useMemo(() => {
    // Get all unique weight values from current data
    const uniqueChainValues = new Set<number>();
    // biome-ignore lint/complexity/noForEach: <explanation>
    currentData?.forEach((userOperation) => {
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      uniqueChainValues.add(userOperation.chain_id!);
    });
    return uniqueChainValues;
  }, [currentData]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <ToolbarSectionWrapper>
      <div className="flex flex-1 items-center space-x-2">
        {table?.getColumn("chain_id") && (
          <DataTableFacetedFilter
            column={table?.getColumn("chain_id")}
            title="Chain"
            options={Array.from(uniqueChainValues).map((chain) => ({
              value: chain.toString(),
              label: getChainNameWithChainId(chain),
            }))}
          />
        )}
        {userOperationColumnFilters.length > 0 && (
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
      <div className="flex items-center space-x-3">
        <Switch
          id="is-testnet"
          checked={isTestnetState ?? false}
          onCheckedChange={() => setIsTestnetState(!isTestnetState)}
        />
        <Label className="text-text-primary text-xs" htmlFor="is-testnet">
          Include Testnets
        </Label>
        <DataTableViewOptions
          table={table}
          columnMapping={{
            // biome-ignore lint/style/useNamingConvention: <explanation>
            chain_id: "Chain",
            hash: "Tx Hash",
            timestamp: "Timestamp",
          }}
        />
      </div>
    </ToolbarSectionWrapper>
  );
}
