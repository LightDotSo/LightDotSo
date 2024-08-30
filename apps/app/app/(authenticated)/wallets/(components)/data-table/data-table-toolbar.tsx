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

import type { WalletData } from "@lightdotso/data";
import { useTables } from "@lightdotso/stores";
import { DataTableViewOptions } from "@lightdotso/templates/data-table";
import { Button } from "@lightdotso/ui/components/button";
import { Input } from "@lightdotso/ui/components/input";
import { ToolbarSectionWrapper } from "@lightdotso/ui/wrappers";
import { Cross2Icon } from "@radix-ui/react-icons";
import type { Table } from "@tanstack/react-table";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface DataTableToolbarProps {
  table: Table<WalletData>;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function DataTableToolbar({ table }: DataTableToolbarProps) {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { walletColumnFilters } = useTables();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <ToolbarSectionWrapper>
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter name..."
          value={(table?.getColumn("name")?.getFilterValue() as string) ?? ""}
          className="h-8 w-[150px] lg:w-[400px]"
          onChange={(event) =>
            table?.getColumn("name")?.setFilterValue(event.target.value)
          }
        />
        {walletColumnFilters.length > 0 && (
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
          name: "Name",
          address: "Address",
          actions: "Actions",
        }}
      />
    </ToolbarSectionWrapper>
  );
}
