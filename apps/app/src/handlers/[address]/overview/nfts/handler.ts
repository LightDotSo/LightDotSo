// Copyright 2023-2024 Light.
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

import { cursorParser, paginationParser } from "@lightdotso/nuqs";
import { getNftValuation, getNfts } from "@lightdotso/services";
import { validateAddress } from "@lightdotso/validators";
import { Result } from "neverthrow";
import { notFound } from "next/navigation";
import type { Address } from "viem";
import { handler as addressHandler } from "@/handlers/[address]/handler";

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

export const handler = async (
  params: { address: string },
  searchParams: {
    cursor?: string;
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

  const cursorState = cursorParser.parseServerSide(searchParams.cursor);
  const paginationState = paginationParser.parseServerSide(
    searchParams.pagination,
  );

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  const { walletSettings } = await addressHandler(params);

  const nftsPromise = getNfts({
    address: params.address as Address,
    is_testnet: walletSettings.is_enabled_testnet,
    limit: paginationState.pageSize,
    cursor: null,
  });

  const nftValuationPromise = getNftValuation({
    address: params.address as Address,
  });

  const [nfts, nftValuation] = await Promise.all([
    nftsPromise,
    nftValuationPromise,
  ]);

  // ---------------------------------------------------------------------------
  // Parse
  // ---------------------------------------------------------------------------

  const res = Result.combineWithAllErrors([nfts, nftValuation]);

  return res.match(
    ([nfts, nftValuation]) => {
      return {
        cursorState: cursorState,
        paginationState: paginationState,
        walletSettings: walletSettings,
        nfts: nfts,
        nftValuation: nftValuation,
      };
    },
    () => {
      return {
        cursorState: cursorState,
        paginationState: paginationState,
        walletSettings: walletSettings,
        nfts: {
          // @ts-ignore
          nfts: [{}],
        },
        nftValuation: {
          wallets: [
            {
              address: params.address,
              usd_value: 0,
            },
          ],
        },
      };
    },
  );
};
