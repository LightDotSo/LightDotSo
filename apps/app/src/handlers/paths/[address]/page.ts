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

import { getPortfolio, getTokens } from "@/services";
import { notFound } from "next/navigation";
import { validateAddress } from "@/handlers/validators/address";
import { Result } from "neverthrow";
import type { Address } from "viem";

export const handler = async (params: { address: string }) => {
  // ---------------------------------------------------------------------------
  // Validators
  // ---------------------------------------------------------------------------

  validateAddress(params.address);

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  const tokensPromise = getTokens(params.address as Address);

  const portfolioPromise = getPortfolio(params.address as Address);

  const [tokens, portfolio] = await Promise.all([
    tokensPromise,
    portfolioPromise,
  ]);

  // ---------------------------------------------------------------------------
  // Parse
  // ---------------------------------------------------------------------------

  const res = Result.combineWithAllErrors([tokens, portfolio]);

  return res.match(
    ([tokens, portfolio]) => {
      return {
        tokens: tokens,
        portfolio: portfolio,
      };
    },
    () => {
      return notFound();
    },
  );
};
