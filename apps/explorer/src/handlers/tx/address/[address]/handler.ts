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
import { getTransactions, getTransactionsCount } from "@lightdotso/services";
import { validateAddress } from "@lightdotso/validators";
import { Result } from "neverthrow";
import { notFound } from "next/navigation";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

export const handler = async (
  params: {
    address: string;
  },
  searchParams: {
    isTestnet?: string;
    pagination?: string;
  },
) => {
  // ---------------------------------------------------------------------------
  // Validators
  // ---------------------------------------------------------------------------

  if (!validateAddress(params.address)) {
    return notFound();
  }

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
    address: params.address as Address,
    offset: paginationState.pageIndex * paginationState.pageSize,
    limit: paginationState.pageSize,
    is_testnet: isTestnetState ?? false,
  });

  const transactionsCountPromise = getTransactionsCount({
    address: params.address as Address,
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
