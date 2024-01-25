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

import { PlaceholderOrb } from "@lightdotso/elements";
import {
  Avatar,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@lightdotso/ui";
import { shortenAddress } from "@lightdotso/utils";
import { useEnsName } from "@lightdotso/wagmi";
import type { FC } from "react";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type ChainCardProps = { address: Address };

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const AddressCard: FC<ChainCardProps> = ({ address }) => {
  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  const { data: ens } = useEnsName({ address: address, chainId: 1 });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <TooltipProvider>
      <Tooltip>
        <div className="flex items-center text-ellipsis">
          <Avatar className="mr-3 size-7">
            <PlaceholderOrb address={address} />
          </Avatar>
          {ens && <span className="mr-3">{ens}</span>}
          <TooltipTrigger asChild>
            <span className="text-xs text-text-weak">
              {shortenAddress(address)}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{address}</p>
          </TooltipContent>
        </div>
      </Tooltip>
    </TooltipProvider>
  );
};
