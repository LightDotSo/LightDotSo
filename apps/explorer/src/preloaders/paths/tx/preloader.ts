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

import { paginationParser } from "@/queryStates";
import { preload as preloadGetTransactions } from "@/services/getTransactions";
import { preload as preloadGetTransactionsCount } from "@/services/getTransactionsCount";

// -----------------------------------------------------------------------------
// Preloader
// -----------------------------------------------------------------------------

export const preloader = async (searchParams: {
  isTestnet?: string;
  pagination?: string;
}) => {
  // ---------------------------------------------------------------------------
  // Parsers
  // ---------------------------------------------------------------------------

  const paginationState = paginationParser.parseServerSide(
    searchParams.pagination,
  );

  // ---------------------------------------------------------------------------
  // Preloaders
  // ---------------------------------------------------------------------------

  preloadGetTransactions({
    address: null,
    offset: paginationState.pageIndex * paginationState.pageSize,
    limit: paginationState.pageSize,
    is_testnet: false,
  });
  preloadGetTransactionsCount({
    address: null,
    is_testnet: false,
  });
};
