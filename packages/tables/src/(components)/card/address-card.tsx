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

"use client";

import { PlaceholderOrb } from "@lightdotso/elements";
import {
  Avatar,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@lightdotso/ui";
import { cn, shortenAddress } from "@lightdotso/utils";
import { useEnsName } from "@lightdotso/wagmi";
import type { FC } from "react";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type ChainCardProps = { address: Address; className?: string };

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const AddressCard: FC<ChainCardProps> = ({ address, className }) => {
  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  const { data: ens } = useEnsName({ address: address as Address, chainId: 1 });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Tooltip>
      <div className={cn("flex items-center text-ellipsis", className)}>
        <Avatar className="mr-3 size-7">
          <PlaceholderOrb address={address} />
        </Avatar>
        {ens && <span className="mr-3">{ens}</span>}
        {!ens && shortenAddress(address)}
        {ens && (
          <>
            <TooltipTrigger asChild>
              <span className="text-text-weak text-xs">
                {shortenAddress(address)}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{address}</p>
            </TooltipContent>
          </>
        )}
      </div>
    </Tooltip>
  );
};
