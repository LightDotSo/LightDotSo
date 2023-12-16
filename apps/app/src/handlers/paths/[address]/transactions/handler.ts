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

import { Result } from "neverthrow";
import type { Address } from "viem";
import { handler as addressHandler } from "@/handlers/paths/[address]/handler";
import { validateAddress } from "@/handlers/validators/address";
import { getUserOperations, getUserOperationsCount } from "@/services";

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

export const handler = async (params: { address: string }) => {
  // ---------------------------------------------------------------------------
  // Validators
  // ---------------------------------------------------------------------------

  validateAddress(params.address);

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  const { walletSettings } = await addressHandler(params);

  const userOperationsPromise = getUserOperations({
    address: params.address as Address,
    status: "proposed",
    offset: 0,
    limit: 10,
    direction: "desc",
    is_testnet: walletSettings.is_enabled_testnet,
  });

  const userOperationsCountPromise = getUserOperationsCount({
    address: params.address as Address,
    status: "proposed",
    is_testnet: walletSettings.is_enabled_testnet,
  });

  const [userOperations, userOperationsCount] = await Promise.all([
    userOperationsPromise,
    userOperationsCountPromise,
  ]);

  // ---------------------------------------------------------------------------
  // Parse
  // ---------------------------------------------------------------------------

  const res = Result.combineWithAllErrors([
    userOperations,
    userOperationsCount,
  ]);

  return res.match(
    ([userOperations, userOperationsCount]) => {
      return {
        walletSettings: walletSettings,
        userOperations: userOperations,
        userOperationsCount: userOperationsCount,
      };
    },
    () => {
      return {
        walletSettings: walletSettings,
        userOperations: [],
        userOperationsCount: { count: 0 },
      };
    },
  );
};
