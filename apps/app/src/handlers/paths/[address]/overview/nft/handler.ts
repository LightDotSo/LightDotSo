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
import { validateAddress } from "@/handlers/validators/address";
import { getPortfolio, getNfts, getWalletSettings } from "@/services";

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

  const walletSettings = await getWalletSettings(params.address as Address);

  const nftsPromise = getNfts(
    params.address as Address,
    walletSettings?.unwrapOr({ is_enabled_testnet: false }).is_enabled_testnet,
  );

  const portfolioPromise = getPortfolio(params.address as Address);

  const [nfts, portfolio] = await Promise.all([nftsPromise, portfolioPromise]);

  // ---------------------------------------------------------------------------
  // Parse
  // ---------------------------------------------------------------------------

  const res = Result.combineWithAllErrors([nfts, portfolio]);

  return res.match(
    ([nfts, portfolio]) => {
      return {
        nfts: nfts,
        portfolio: portfolio,
      };
    },
    () => {
      return notFound();
    },
  );
};
