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

import { preloader as addressPreloader } from "@/preloaders/[address]/preloader";
import { paginationParser } from "@lightdotso/nuqs";
import { preloadGetNftValuation, preloadGetNfts } from "@lightdotso/services";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Preloader
// -----------------------------------------------------------------------------

export const preloader = (
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
  preloadGetNfts({
    address: params.address as Address,
    limit: paginationState.pageSize,
    is_testnet: false,
    cursor: null,
  });
  preloadGetNftValuation({ address: params.address as Address });
};
