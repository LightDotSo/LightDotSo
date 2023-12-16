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
import { preloader as addressPreloader } from "@/preloaders/paths/[address]/preloader";
import { paginationParser } from "@/querystates";
import { preload as preloadGetPortfolio } from "@/services/getPortfolio";
import { preload as preloadGetTokens } from "@/services/getTokens";
import { preload as preloadGetTokensCount } from "@/services/getTokensCount";

// -----------------------------------------------------------------------------
// Preloader
// -----------------------------------------------------------------------------

export const preloader = async (
  params: { address: string },
  searchParams: {
    pagination?: string;
  },
) => {
  // ---------------------------------------------------------------------------
  // Parsers
  // ---------------------------------------------------------------------------

  const paginationState = paginationParser.parseServerSide(
    searchParams.pagination,
  );

  // ---------------------------------------------------------------------------
  // Preloaders
  // ---------------------------------------------------------------------------

  addressPreloader(params);
  preloadGetPortfolio({ address: params.address as Address });
  preloadGetTokens({
    address: params.address as Address,
    offset: paginationState.pageIndex * paginationState.pageSize,
    limit: paginationState.pageSize,
    is_testnet: false,
  });
  preloadGetTokensCount({
    address: params.address as Address,
    is_testnet: false,
  });
};
