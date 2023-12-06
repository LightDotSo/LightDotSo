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

/* eslint-disable @next/next/no-img-element */

import { Button } from "@lightdotso/ui";
import Link from "next/link";
import { type FC } from "react";
import { NftImage } from "@/components/nft/nft-image";
import { SIMPLEHASH_CHAIN_ID_MAPPING } from "@/const/simplehash";
import type { NftData } from "@/data";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type NftCardProps = {
  address: string;
  nft: NftData;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const NftCard: FC<NftCardProps> = ({ address, nft }) => {
  return (
    <li className="group relative col-span-1 flex flex-col overflow-hidden rounded-2xl border border-border text-center">
      <NftImage nft={nft} />
      <div className="absolute inset-x-0 bottom-0 opacity-0 transition-all duration-300 animate-out slide-out-to-bottom group-hover:opacity-100 group-hover:animate-in group-hover:fade-in group-hover:zoom-in group-hover:slide-in-from-bottom">
        <Button asChild className="w-full py-2">
          <Link
            href={`/${address}/send?transfers=0:_:_:${
              SIMPLEHASH_CHAIN_ID_MAPPING[
                nft.chain! as keyof typeof SIMPLEHASH_CHAIN_ID_MAPPING
              ]
            }:${nft.contract.type?.toLowerCase()}:${nft.contract_address}|${
              nft.token_id
            }|${nft.contract.type?.toLowerCase() === "erc721" ? 1 : 0}`}
          >
            Send
          </Link>
        </Button>
      </div>
    </li>
  );
};
