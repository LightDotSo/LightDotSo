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
import type { Address } from "viem";
import { handler as addressHandler } from "@/handlers/paths/[address]/handler";
import { validateAddress } from "@/handlers/validators/address";
import { paginationParser } from "@/querystates";
import { getTransactions, getTransactionsCount } from "@/services";

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

export const handler = async (
  params: { address: string },
  searchParams: {
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

  const paginationState = paginationParser.parseServerSide(
    searchParams.pagination,
  );

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  const { walletSettings } = await addressHandler(params);

  const transactionsPromise = getTransactions({
    address: params.address as Address,
    offset: paginationState.pageIndex * paginationState.pageSize,
    limit: paginationState.pageSize,
    is_testnet: walletSettings.is_enabled_testnet,
  });

  const transactionsCountPromise = getTransactionsCount({
    address: params.address as Address,
    is_testnet: walletSettings.is_enabled_testnet,
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
        walletSettings: walletSettings,
        transactions: transactions,
        transactionsCount: transactionsCount,
      };
    },
    () => {
      return notFound();
    },
  );
};
