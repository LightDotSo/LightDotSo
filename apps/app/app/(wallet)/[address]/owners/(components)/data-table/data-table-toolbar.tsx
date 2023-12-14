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

import { Button, Input } from "@lightdotso/ui";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useQueryClient } from "@tanstack/react-query";
import type { Table } from "@tanstack/react-table";
import { useMemo } from "react";
import type { Address } from "viem";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import type { ConfigurationData, ConfigurationOwnerData } from "@/data";
import { queries } from "@/queries";
import { useAuth, useTables } from "@/stores";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface DataTableToolbarProps {
  table: Table<ConfigurationOwnerData>;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function DataTableToolbar({ table }: DataTableToolbarProps) {
  // ---------------------------------------------------------------------------
  // Store
  // ---------------------------------------------------------------------------

  const { wallet } = useAuth();
  const { ownerColumnFilters } = useTables();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: ConfigurationData | undefined = queryClient.getQueryData(
    queries.configuration.get(wallet as Address).queryKey,
  );

  // ---------------------------------------------------------------------------
  // Hook
  // ---------------------------------------------------------------------------

  const uniqueWeightValues = useMemo(() => {
    // Get all unique weight values from current data
    const uniqueWeightValues = new Set<number>();
    currentData?.owners.forEach(owner => {
      uniqueWeightValues.add(owner.weight);
    });
    return uniqueWeightValues;
  }, [currentData]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter owners..."
          value={(table.getColumn("address")?.getFilterValue() as string) ?? ""}
          className="h-8 w-[150px] lg:w-[250px]"
          onChange={event =>
            table.getColumn("address")?.setFilterValue(event.target.value)
          }
        />
        {table.getColumn("weight") && (
          <DataTableFacetedFilter
            column={table.getColumn("weight")}
            title="Weight"
            options={Array.from(uniqueWeightValues).map(i => ({
              value: i.toString(),
              label: i.toString(),
            }))}
          />
        )}
        {ownerColumnFilters.length > 0 && (
          <Button
            variant="outline"
            className="h-8 px-2 lg:px-3"
            onClick={() => table.resetColumnFilters()}
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions
        table={table}
        columnMapping={{
          select: "Select",
          index: "Index",
          address: "Owner",
          weight: "Weight",
        }}
      />
    </div>
  );
}
