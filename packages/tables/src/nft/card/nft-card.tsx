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

/* eslint-disable @next/next/no-img-element */

import type { NftData } from "@lightdotso/data";
import { NftImage } from "@lightdotso/elements";
import { useIsDemoPathname } from "@lightdotso/hooks";
import { useAuth } from "@lightdotso/stores";
import { ChainLogo } from "@lightdotso/svg";
import { Button } from "@lightdotso/ui";
import {
  cn,
  getChainBySimplehashChainName,
  getChainIdBySimplehashChainName,
} from "@lightdotso/utils";
import Link from "next/link";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type NftCardProps = {
  nft: NftData;
  showName?: boolean;
  showDescription?: boolean;
  showSpamScore?: boolean;
  showChain?: boolean;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const NftCard: FC<NftCardProps> = ({
  nft,
  showChain = false,
  showName = true,
  showDescription = true,
  showSpamScore = false,
}) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { wallet } = useAuth();
  const isDemo = useIsDemoPathname();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <li
      className={cn(
        "group relative col-span-1 flex flex-col overflow-hidden rounded-md bg-background",
        "border border-border",
      )}
    >
      <NftImage nft={nft} className="rounded-t-md" />
      {(showChain || showName || showDescription || showSpamScore) && (
        <div className="flex flex-col space-y-3 px-3 py-4">
          {showChain && (
            <div className="flex items-center text-text-weak text-xs">
              {getChainIdBySimplehashChainName(nft.chain!) && (
                <ChainLogo
                  className="mr-1.5 size-4"
                  chainId={getChainIdBySimplehashChainName(nft.chain!)}
                />
              )}
              {getChainBySimplehashChainName(nft.chain!)?.name}
            </div>
          )}
          {showName && <div className="text-sm text-text">{nft.name}</div>}
          {showDescription && (
            <div className="text-text-weak text-xs"># {nft.token_id}</div>
          )}
          {showSpamScore && (
            <div className="text-text-weak text-xs">
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
            href={`/${!isDemo ? wallet : "demo"}/send?transfers=0:_:_:${getChainIdBySimplehashChainName(
              nft.chain!,
            )}:${nft.contract?.type?.toLowerCase()}:${nft.contract_address}|${
              nft.token_id
            }|${nft.contract?.type?.toLowerCase() === "erc721" ? 1 : 0}`}
          >
            Send
          </Link>
        </Button>
      </div>
    </li>
  );
};
