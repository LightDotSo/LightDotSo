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
import { validateAddress } from "@/handlers/validators/address";
import { isTestnetParser, paginationParser } from "@/queryStates";
import { getUserOperations, getUserOperationsCount } from "@/services";

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

export const handler = async (
  params: { address: string },
  searchParams: {
    isTestnet?: string;
    pagination?: string;
  },
) => {
  // ---------------------------------------------------------------------------
  // Validators
  // ---------------------------------------------------------------------------

  validateAddress(params.address);

  // ---------------------------------------------------------------------------
  // Parsers
  // ---------------------------------------------------------------------------

  const isTestnet = isTestnetParser.parseServerSide(searchParams.isTestnet);

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
    order: "asc",
    is_testnet: isTestnet ?? false,
  });

  const userOperationsCountPromise = getUserOperationsCount({
    address: null,
    status: "history",
    is_testnet: isTestnet ?? false,
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
        paginationState: paginationState,
        userOperations: userOperations,
        userOperationsCount: userOperationsCount,
      };
    },
    () => {
      return {
        paginationState: paginationState,
        userOperations: [],
        userOperationsCount: { count: 0 },
      };
    },
  );
};
