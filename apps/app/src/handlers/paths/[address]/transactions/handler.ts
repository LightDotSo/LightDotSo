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

import { TRANSACTION_ROW_COUNT } from "@lightdotso/const";
import {
  getUserOperations,
  getUserOperationsCount,
} from "@lightdotso/services";
import { Result } from "neverthrow";
import type { Address } from "viem";
import { handler as addressHandler } from "@/handlers/paths/[address]/handler";
import { validateAddress } from "@/handlers/validators/address";

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

  const userOperationsCountPromise = getUserOperationsCount({
    address: params.address as Address,
    status: null,
    is_testnet: walletSettings.is_enabled_testnet,
  });

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
    userOperationsCount,
    queuedUserOperations,
    queuedUserOperationsCount,
    historyUserOperations,
    historyUserOperationsCount,
  ] = await Promise.all([
    userOperationsCountPromise,
    queuedUserOperationsPromise,
    queuedUserOperationsCountPromise,
    historyUserOperationsPromise,
    historyUserOperationsCountPromise,
  ]);

  // ---------------------------------------------------------------------------
  // Parse
  // ---------------------------------------------------------------------------

  const res = Result.combineWithAllErrors([
    userOperationsCount,
    queuedUserOperations,
    queuedUserOperationsCount,
    historyUserOperations,
    historyUserOperationsCount,
  ]);

  return res.match(
    ([
      userOperationsCount,
      queuedUserOperations,
      queuedUserOperationsCount,
      historyUserOperations,
      historyUserOperationsCount,
    ]) => {
      return {
        walletSettings: walletSettings,
        userOperationsCount: userOperationsCount,
        queuedUserOperations: queuedUserOperations,
        queuedUserOperationsCount: queuedUserOperationsCount,
        historyUserOperations: historyUserOperations,
        historyUserOperationsCount: historyUserOperationsCount,
      };
    },
    () => {
      return {
        walletSettings: walletSettings,
        userOperationsCount: { count: 0 },
        queuedUserOperations: [],
        queuedUserOperationsCount: { count: 0 },
        historyUserOperations: [],
        historyUserOperationsCount: { count: 0 },
      };
    },
  );
};
