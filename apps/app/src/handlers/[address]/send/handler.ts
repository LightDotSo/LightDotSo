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

import { transfersParser } from "@lightdotso/nuqs";
import { getNfts, getTokens } from "@lightdotso/services";
import { validateAddress } from "@lightdotso/validators";
import { notFound } from "next/navigation";
import type { Address } from "viem";
import { handler as addressHandler } from "@/handlers/[address]/handler";

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

export const handler = async (
  params: { address: string },
  searchParams: {
    transfers?: string;
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

  const transfers = transfersParser.parseServerSide(searchParams.transfers);

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  const { wallet, config, walletSettings } = await addressHandler(params);

  const nftsPromise = getNfts({
    address: params.address as Address,
    limit: Number.MAX_SAFE_INTEGER,
    is_testnet: walletSettings.is_enabled_testnet,
    cursor: null,
  });

  const tokensPromise = getTokens({
    address: params.address as Address,
    offset: 0,
    limit: Number.MAX_SAFE_INTEGER,
    is_testnet: walletSettings.is_enabled_testnet,
    group: false,
    chain_ids: null,
  });

  const [nftsRes, tokensRes] = await Promise.all([nftsPromise, tokensPromise]);

  // ---------------------------------------------------------------------------
  // Parse
  // ---------------------------------------------------------------------------

  return {
    transfers: transfers,
    wallet: wallet,
    config: config,
    walletSettings: walletSettings,
    tokens: tokensRes.unwrapOr([]),
    nfts: nftsRes.unwrapOr([]),
  };
};
