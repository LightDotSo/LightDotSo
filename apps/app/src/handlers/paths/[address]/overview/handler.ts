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

import type { Address } from "viem";
import { OVERVIEW_ROW_COUNT } from "@/const/numbers";
import { handler as addressHandler } from "@/handlers/paths/[address]/handler";
import { validateAddress } from "@/handlers/validators/address";
import {
  getPortfolio,
  getNfts,
  getNftValuation,
  getTransactions,
  getTokens,
} from "@/services";

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

  const tokensPromise = getTokens({
    address: params.address as Address,
    offset: 0,
    limit: OVERVIEW_ROW_COUNT,
    is_testnet: walletSettings.is_enabled_testnet,
  });

  const portfolioPromise = getPortfolio({ address: params.address as Address });

  const nftsPromise = getNfts({
    address: params.address as Address,
    is_testnet: walletSettings.is_enabled_testnet,
  });

  const nftValuationPromise = getNftValuation({
    address: params.address as Address,
  });

  const transactionsPromise = getTransactions({
    address: params.address as Address,
    offset: 0,
    limit: OVERVIEW_ROW_COUNT,
    is_testnet: walletSettings.is_enabled_testnet,
  });

  const [tokensRes, portfolioRes, nftsRes, nftValuationRes, transactionsRes] =
    await Promise.all([
      tokensPromise,
      portfolioPromise,
      nftsPromise,
      nftValuationPromise,
      transactionsPromise,
    ]);

  // ---------------------------------------------------------------------------
  // Parse
  // ---------------------------------------------------------------------------

  return {
    walletSettings: walletSettings,
    tokens: tokensRes.unwrapOr([]),
    portfolio: portfolioRes.unwrapOr({
      balance: 0,
      balance_change_24h: 0,
      balance_change_24h_percentage: 0,
      balances: [],
    }),
    nfts: nftsRes.unwrapOr([]),
    nftValuation: nftValuationRes.unwrapOr({
      wallets: [{ address: params.address, usd_value: 0 }],
    }),
    transactions: transactionsRes.unwrapOr([]),
  };
};
