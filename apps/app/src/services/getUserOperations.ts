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

import { getUserOperations as getClientUserOperations } from "@lightdotso/client";
import "server-only";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Pre
// -----------------------------------------------------------------------------

export const preload = (address: Address) => {
  void getUserOperations(address);
};

// -----------------------------------------------------------------------------
// Service
// -----------------------------------------------------------------------------

export const getUserOperations = async (
  address: Address,
  status?: "proposed" | "pending" | "executed" | "reverted" | "all",
  direction?: "asc" | "desc",
  limit?: number,
) => {
  return getClientUserOperations(
    {
      params: {
        query: {
          address,
          status: status === "all" ? undefined : status,
          direction: direction ?? undefined,
          limit: limit ?? undefined,
        },
      },
    },
    false,
  );
};
