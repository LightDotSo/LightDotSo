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
import { getPortfolio, getTokens, getTokensCount } from "@/services";

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

  const tokensPromise = getTokens({
    address: params.address as Address,
    offset: paginationState.pageIndex * paginationState.pageSize,
    limit: paginationState.pageSize,
    is_testnet: walletSettings.is_enabled_testnet,
  });

  const tokensCountPromise = getTokensCount({
    address: params.address as Address,
    is_testnet: walletSettings.is_enabled_testnet,
  });

  const portfolioPromise = getPortfolio({ address: params.address as Address });

  const [tokens, tokensCount, portfolio] = await Promise.all([
    tokensPromise,
    tokensCountPromise,
    portfolioPromise,
  ]);

  // ---------------------------------------------------------------------------
  // Parse
  // ---------------------------------------------------------------------------

  const res = Result.combineWithAllErrors([tokens, tokensCount, portfolio]);

  return res.match(
    ([tokens, tokensCount, portfolio]) => {
      return {
        walletSettings: walletSettings,
        tokens: tokens,
        tokensCount: tokensCount,
        portfolio: portfolio,
      };
    },
    () => {
      return notFound();
    },
  );
};
