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

import { isTestnetParser, paginationParser } from "@lightdotso/nuqs";
import {
  getUserOperations,
  getUserOperationsCount,
} from "@lightdotso/services";
import { Result } from "neverthrow";

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

export const handler = async (searchParams: {
  isTestnet?: string;
  pagination?: string;
}) => {
  // ---------------------------------------------------------------------------
  // Parsers
  // ---------------------------------------------------------------------------

  const isTestnetState = isTestnetParser.parseServerSide(
    searchParams.isTestnet,
  );

  const paginationState = paginationParser.parseServerSide(
    searchParams.pagination,
  );

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  const userOperationsPromise = getUserOperations({
    address: null,
    status: "history",
    offset: paginationState.pageIndex * paginationState.pageSize,
    limit: paginationState.pageSize,
    order: "desc",
    is_testnet: isTestnetState ?? false,
  });

  const userOperationsCountPromise = getUserOperationsCount({
    address: null,
    status: "history",
    is_testnet: isTestnetState ?? false,
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
        isTestnetState: isTestnetState,
        paginationState: paginationState,
        userOperations: userOperations,
        userOperationsCount: userOperationsCount,
      };
    },
    () => {
      return {
        isTestnetState: isTestnetState,
        paginationState: paginationState,
        userOperations: [],
        userOperationsCount: { count: 0 },
      };
    },
  );
};
