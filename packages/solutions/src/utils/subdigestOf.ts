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

// From: https://github.com/0xsequence/wallet-contracts/blob/e0c5382636a88b4db4bcf0a70623355d7cd30fb4/test/utils/sequence.ts#L369

import type { Address } from "viem";
import { encodePacked, keccak256, fromBytes } from "viem";

export const subdigestOf = (
  address: Address,
  digest: Uint8Array,
  chainId: bigint,
) => {
  return keccak256(
    encodePacked(
      ["string", "uint256", "address", "bytes32"],
      ["\x19\x01", chainId, address, fromBytes(digest, "hex")],
    ),
  );
};
