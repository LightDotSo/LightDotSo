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
import { notFound } from "next/navigation";
import { isTestnetParser, paginationParser } from "@/queryStates";
import { getTransactions, getTransactionsCount } from "@/services";

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

  const transactionsPromise = getTransactions({
    address: undefined,
    offset: paginationState.pageIndex * paginationState.pageSize,
    limit: paginationState.pageSize,
    is_testnet: isTestnetState ?? false,
  });

  const transactionsCountPromise = getTransactionsCount({
    address: undefined,
    is_testnet: isTestnetState ?? false,
  });

  const [transactions, transactionsCount] = await Promise.all([
    transactionsPromise,
    transactionsCountPromise,
  ]);

  // ---------------------------------------------------------------------------
  // Parse
  // ---------------------------------------------------------------------------

  const res = Result.combineWithAllErrors([transactions, transactionsCount]);

  return res.match(
    ([transactions, transactionsCount]) => {
      return {
        isTestnetState: isTestnetState,
        paginationState: paginationState,
        transactions: transactions,
        transactionsCount: transactionsCount,
      };
    },
    () => {
      return notFound();
    },
  );
};
