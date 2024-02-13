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

import { shortenAddress } from "@lightdotso/utils";
import { useEnsAddress } from "@lightdotso/wagmi";
import type { FC } from "react";
import { normalize } from "viem/ens";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type EnsAddressProps = {
  name: string;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const EnsAddress: FC<EnsAddressProps> = ({ name }) => {
  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  const { data: ensAddress } = useEnsAddress({
    name: normalize(name),
    chainId: 1,
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return <>{ensAddress && shortenAddress(ensAddress)}</>;
};
