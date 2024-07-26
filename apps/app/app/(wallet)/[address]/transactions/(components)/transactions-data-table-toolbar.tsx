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

import type { DataTableToolbarProps } from "@/app/(wallet)/[address]/transactions/(components)/data-table/data-table-toolbar";
import { DataTableToolbar } from "@/app/(wallet)/[address]/transactions/(components)/data-table/data-table-toolbar";
import { useTables } from "@lightdotso/stores";
import { type FC, useEffect } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type TransactionsDataTableToolbarProps = Pick<
  DataTableToolbarProps,
  "status"
>;

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TransactionsDataTableToolbar: FC<
  TransactionsDataTableToolbarProps
> = ({ status }) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { userOperationTable } = useTables();

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!useTables.persist.hasHydrated()) {
      useTables.persist.rehydrate();
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!userOperationTable || !useTables.persist.hasHydrated()) {
    return null;
  }

  return <DataTableToolbar status={status} table={userOperationTable} />;
};
