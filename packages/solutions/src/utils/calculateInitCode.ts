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

import { encodePacked, getFunctionSelector } from "viem";
import type { Address, Hex } from "viem";

export const calculateInitCode = (
  factory_address: Address,
  image_hash: Hex,
  salt: Hex,
) => {
  return encodePacked(
    ["address", "bytes"],
    [
      factory_address,
      encodePacked(
        ["bytes4", "bytes32", "bytes32"],
        [
          getFunctionSelector("createAccount(bytes32,bytes32)"),
          image_hash,
          salt,
        ],
      ),
    ],
  );
};
