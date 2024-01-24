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
import { Avatar } from "@lightdotso/ui";
import { shortenAddress } from "@lightdotso/utils";
import type { FC } from "react";
import type { Address } from "viem";
import { useEnsName } from "wagmi";

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
    <div className="flex items-center text-ellipsis">
      <Avatar className="mr-3 size-7">
        <PlaceholderOrb address={address} />
      </Avatar>
      {ens && <span className="mr-3">{ens}</span>}
      {shortenAddress(address)}
    </div>
  );
};
