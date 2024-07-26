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

import { handler as addressHandler } from "@/handlers/[address]/handler";
import { TRANSACTION_ROW_COUNT } from "@lightdotso/const";
import {
  getUserOperations,
  getUserOperationsCount,
} from "@lightdotso/services";
import { validateAddress } from "@lightdotso/validators";
import { Result } from "neverthrow";
import { notFound } from "next/navigation";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

export const handler = async (params: { address: string }) => {
  // ---------------------------------------------------------------------------
  // Validators
  // ---------------------------------------------------------------------------

  if (!validateAddress(params.address)) {
    return notFound();
  }

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
    status: "queued",
    offset: 0,
    limit: TRANSACTION_ROW_COUNT,
    order: "asc",
    is_testnet: walletSettings.is_enabled_testnet,
  });
  const queuedUserOperationsCountPromise = getUserOperationsCount({
    address: params.address as Address,
    status: "queued",
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
