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
import { cn } from "@lightdotso/utils";
import Link from "next/link";
import { type FC } from "react";
import { NftImage } from "@/components/nft/nft-image";
import type { NftData } from "@/data";
import { useAuth } from "@/stores/useAuth";
import { getChainIdBySimplehashChainName } from "@/utils/chain";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type NftCardProps = {
  nft: NftData;
  showName?: boolean;
  showDescription?: boolean;
  showSpamScore?: boolean;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const NftCard: FC<NftCardProps> = ({
  nft,
  showName = true,
  showDescription = true,
  showSpamScore = false,
}) => {
  const { wallet } = useAuth();

  return (
    <li
      className={cn(
        "group relative col-span-1 rounded-md flex flex-col overflow-hidden bg-background",
        "border border-border",
      )}
    >
      <NftImage nft={nft} className="rounded-t-md" />
      {(showName || showDescription) && (
        <div className="flex flex-col space-y-3 px-3 py-4">
          {showName && <div className="text-sm text-text">{nft.name}</div>}
          {showDescription && (
            <div className="text-xs text-text-weak"># {nft.token_id}</div>
          )}
          {showSpamScore && (
            <div className="text-xs text-text-weak">
              Spam Score: {nft.collection?.spam_score}
            </div>
          )}
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 translate-y-2 opacity-0 transition-transform duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <Button
          asChild
          className="w-full rounded-none py-2 opacity-100 hover:bg-background-primary-strong"
        >
          <Link
            href={`/${wallet}/send?transfers=0:_:_:${getChainIdBySimplehashChainName(
              nft.chain!,
            )}:${nft.contract.type?.toLowerCase()}:${nft.contract_address}|${
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
