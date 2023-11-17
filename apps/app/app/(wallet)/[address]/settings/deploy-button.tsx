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

import { Button } from "@lightdotso/ui";
import type { Address, Hex } from "viem";
import { ContractLinks } from "@lightdotso/const";
import { calculateInitCode } from "@lightdotso/solutions";
import Link from "next/link";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type DeployButtonProps = {
  chainId?: number;
  image_hash: Hex;
  salt: Hex;
  children: React.ReactNode;
  wallet: Address;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const DeployButton: FC<DeployButtonProps> = ({
  chainId = 11155111,
  image_hash,
  salt,
  children,
  wallet,
}) => {
  let initCode = calculateInitCode(
    ContractLinks["Factory"] as Address,
    image_hash,
    salt,
  );

  return (
    <Button asChild>
      <Link href={`/${wallet}/op/${chainId}?initCode=${initCode}`}>
        {children}
      </Link>
    </Button>
  );
};
