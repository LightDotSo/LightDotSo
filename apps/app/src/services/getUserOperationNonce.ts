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

import { getUserOperationNonce as getClientUserOperationNonce } from "@lightdotso/client";
import "server-only";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Pre
// -----------------------------------------------------------------------------

export const preload = (address: Address, chain_id: number) => {
  void getUserOperationNonce(address, chain_id);
};

// -----------------------------------------------------------------------------
// Service
// -----------------------------------------------------------------------------

export const getUserOperationNonce = async (
  address: Address,
  chain_id: number,
  paymaster: Address = "0x000000000003193FAcb32D1C120719892B7AE977",
) => {
  return getClientUserOperationNonce(
    {
      params: {
        query: { address: address, chain_id: chain_id, paymaster: paymaster },
      },
    },
    false,
  );
};
