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

import { verifyUserId } from "@/auth";
import { paginationParser } from "@lightdotso/nuqs";
import { getUser, getWallets, getWalletsCount } from "@lightdotso/services";
import { Result } from "neverthrow";

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

export const handler = async (searchParams: { pagination?: string }) => {
  // ---------------------------------------------------------------------------
  // Auth
  // ---------------------------------------------------------------------------

  const userId = await verifyUserId();

  // ---------------------------------------------------------------------------
  // Parsers
  // ---------------------------------------------------------------------------

  const paginationState = paginationParser.parseServerSide(
    searchParams.pagination,
  );

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  const userPromise = getUser({
    address: undefined,
    user_id: userId,
  });

  const walletsPromise = getWallets({
    address: null,
    offset: paginationState.pageIndex * paginationState.pageSize,
    limit: paginationState.pageSize,
    user_id: userId,
  });

  const walletsCountPromise = getWalletsCount({
    address: null,
    user_id: userId,
  });

  const [user, wallets, walletsCount] = await Promise.all([
    userPromise,
    walletsPromise,
    walletsCountPromise,
  ]);

  // ---------------------------------------------------------------------------
  // Parse
  // ---------------------------------------------------------------------------

  const res = Result.combineWithAllErrors([user, wallets, walletsCount]);

  return res.match(
    ([user, wallets, walletsCount]) => {
      return {
        paginationState: paginationState,
        user: user,
        wallets: wallets,
        walletsCount: walletsCount,
      };
    },
    () => {
      return {
        paginationState: paginationState,
        user: {
          address: "",
          id: "",
        },
        wallets: [],
        walletsCount: {
          count: 0,
        },
      };
    },
  );
};
