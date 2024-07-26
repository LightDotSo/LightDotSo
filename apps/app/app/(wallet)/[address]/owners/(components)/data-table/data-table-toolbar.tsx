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

import type { OwnerData } from "@lightdotso/data";
import { useQueryConfiguration } from "@lightdotso/query";
import { useAuth, useTables } from "@lightdotso/stores";
import {
  DataTableFacetedFilter,
  DataTableViewOptions,
} from "@lightdotso/templates";
import { Button, Input, ToolbarSectionWrapper } from "@lightdotso/ui";
import { Cross2Icon } from "@radix-ui/react-icons";
import type { Table } from "@tanstack/react-table";
import { useMemo } from "react";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface DataTableToolbarProps {
  table: Table<OwnerData>;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function DataTableToolbar({ table }: DataTableToolbarProps) {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { wallet } = useAuth();
  const { ownerColumnFilters } = useTables();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { configuration } = useQueryConfiguration({
    address: wallet as Address,
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const uniqueWeightValues = useMemo(() => {
    // Get all unique weight values from current data
    const uniqueWeightValues = new Set<number>();
    configuration?.owners.forEach((owner) => {
      uniqueWeightValues.add(owner.weight);
    });
    return uniqueWeightValues;
  }, [configuration]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <ToolbarSectionWrapper>
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter owners..."
          value={
            (table?.getColumn("address")?.getFilterValue() as string) ?? ""
          }
          className="h-8 w-[150px] lg:w-[250px]"
          onChange={(event) =>
            table?.getColumn("address")?.setFilterValue(event.target.value)
          }
        />
        {table?.getColumn("weight") && (
          <DataTableFacetedFilter
            column={table?.getColumn("weight")}
            title="Weight"
            options={Array.from(uniqueWeightValues).map((i) => ({
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
            <Cross2Icon className="ml-2 size-4" />
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
    </ToolbarSectionWrapper>
  );
}
