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
import { TRANSACTION_ROW_COUNT } from "@/const/numbers";
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

  const queuedUserOperationsPromise = getUserOperations({
    address: params.address as Address,
    status: "proposed",
    offset: 0,
    limit: TRANSACTION_ROW_COUNT,
    order: "asc",
    is_testnet: walletSettings.is_enabled_testnet,
  });
  const queuedUserOperationsCountPromise = getUserOperationsCount({
    address: params.address as Address,
    status: "proposed",
    is_testnet: walletSettings.is_enabled_testnet,
  });

  const historyUserOperationsPromise = getUserOperations({
    address: params.address as Address,
    status: "history",
    offset: 0,
    limit: TRANSACTION_ROW_COUNT,
    order: "desc",
    is_testnet: walletSettings.is_enabled_testnet,
  });
  const historyUserOperationsCountPromise = getUserOperationsCount({
    address: params.address as Address,
    status: "history",
    is_testnet: walletSettings.is_enabled_testnet,
  });

  const [
    queuedUserOperations,
    queuedUserOperationsCount,
    historyUserOperations,
    historyUserOperationsCount,
  ] = await Promise.all([
    queuedUserOperationsPromise,
    queuedUserOperationsCountPromise,
    historyUserOperationsPromise,
    historyUserOperationsCountPromise,
  ]);

  // ---------------------------------------------------------------------------
  // Parse
  // ---------------------------------------------------------------------------

  const res = Result.combineWithAllErrors([
    queuedUserOperations,
    queuedUserOperationsCount,
    historyUserOperations,
    historyUserOperationsCount,
  ]);

  return res.match(
    ([
      queuedUserOperations,
      queuedUserOperationsCount,
      historyUserOperations,
      historyUserOperationsCount,
    ]) => {
      return {
        walletSettings: walletSettings,
        queuedUserOperations: queuedUserOperations,
        queuedUserOperationsCount: queuedUserOperationsCount,
        historyUserOperations: historyUserOperations,
        historyUserOperationsCount: historyUserOperationsCount,
      };
    },
    () => {
      return {
        walletSettings: walletSettings,
        queuedUserOperations: [],
        queuedUserOperationsCount: { count: 0 },
        historyUserOperations: [],
        historyUserOperationsCount: { count: 0 },
      };
    },
  );
};
