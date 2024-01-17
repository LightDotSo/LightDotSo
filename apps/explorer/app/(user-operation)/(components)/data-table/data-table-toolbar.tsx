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

import type { UserOperationData } from "@lightdotso/data";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth, useTables } from "@lightdotso/stores";
import {
  Button,
  DataTableFacetedFilter,
  DataTableViewOptions,
  ToolbarSectionWrapper,
  Switch,
  Label,
} from "@lightdotso/ui";
import { getChainNameById } from "@lightdotso/utils";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useQueryClient } from "@tanstack/react-query";
import type { Table } from "@tanstack/react-table";
import { useMemo } from "react";
import type { Address } from "viem";
import { usePaginationQueryState, useIsTestnetQueryState } from "@/queryStates";

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
      is_testnet: isTestnetState ?? false,
    }).queryKey,
  );

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const uniqueChainValues = useMemo(() => {
    // Get all unique weight values from current data
    const uniqueChainValues = new Set<number>();
    currentData?.forEach(userOperation => {
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
        {table.getColumn("chain_id") && (
          <DataTableFacetedFilter
            column={table.getColumn("chain_id")}
            title="Chain"
            options={Array.from(uniqueChainValues).map(chain => ({
              value: chain.toString(),
              label: getChainNameById(chain),
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
      <div className="flex items-center space-x-2">
        <Switch
          id="is-testnet"
          checked={isTestnetState ?? false}
          onCheckedChange={() => setIsTestnetState(!isTestnetState)}
        />
        <Label className="text-xs text-text-primary" htmlFor="is-testnet">
          Include Testnet
        </Label>
        <DataTableViewOptions
          table={table}
          columnMapping={{
            chain_id: "Chain",
            hash: "Tx Hash",
            timestamp: "Timestamp",
          }}
        />
      </div>
    </ToolbarSectionWrapper>
  );
}
