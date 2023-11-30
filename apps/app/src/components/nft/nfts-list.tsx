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

"use client";

import { getNftsByOwner } from "@lightdotso/client";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import type { FC } from "react";
import type { Address } from "viem";
import { NftCard } from "@/components/nft/nft-card";
import { NftsEmpty } from "@/components/nft/nfts-empty";
import { NftsWrapper } from "@/components/nft/nfts-wrapper";
import type { NftData, WalletSettingsData } from "@/data";
import { queries } from "@/queries";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type NftsListProps = {
  address: Address;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const NftsList: FC<NftsListProps> = ({ address }) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const walletSettings: WalletSettingsData | undefined =
    useQueryClient().getQueryData(queries.wallet.settings(address).queryKey);

  const currentData: NftData | undefined = useQueryClient().getQueryData(
    queries.nft.list({
      address,
      is_testnet: walletSettings?.is_enabled_testnet,
    }).queryKey,
  );

  const { data } = useSuspenseQuery<NftData | null>({
    queryKey: queries.nft.list({
      address,
      is_testnet: walletSettings?.is_enabled_testnet,
    }).queryKey,
    queryFn: async () => {
      const res = await getNftsByOwner(
        address,
        walletSettings?.is_enabled_testnet,
      );

      // Return if the response is 200
      return res.match(
        data => {
          return data;
        },
        _ => {
          return currentData ?? null;
        },
      );
    },
  });

  return (
    <NftsWrapper>
      {data && data.nfts.length === 0 && <NftsEmpty />}
      {data &&
        data.nfts.map(nft => (
          <NftCard key={nft.nft_id} address={address} nft={nft} />
        ))}
    </NftsWrapper>
  );
};
