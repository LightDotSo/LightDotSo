// Copyright 2023-2024 Light, Inc.
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

import {
  useTransferQueryState,
  useUserOperationsIndexQueryState,
  useUserOperationsQueryState,
} from "@lightdotso/nuqs";
import { useQueryConfiguration } from "@lightdotso/query";
import type { Transfer } from "@lightdotso/schemas";
import { useAuth, useDev } from "@lightdotso/stores";
import { Transaction } from "@lightdotso/templates";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@lightdotso/ui";
import { useEffect, useMemo } from "react";
import type { FC } from "react";
import { isAddressEqual } from "viem";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type DepositDialogProps = {
  address: Address;
  initialTransfer?: Transfer;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const DepositDialog: FC<DepositDialogProps> = ({
  address,
  initialTransfer,
}) => {
  // ---------------------------------------------------------------------------
  // Query State Hooks
  // ---------------------------------------------------------------------------

  const [transfer, setTransfer] = useTransferQueryState();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { configuration } = useQueryConfiguration({
    address: address,
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!configuration) {
    return null;
  }

  return null;
};
