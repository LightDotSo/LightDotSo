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

import { encodePacked, keccak256 } from "viem";
import type { Signer } from "../typings";

export const calculateImageHash = (
  threshold: bigint,
  checkpoint: bigint,
  signers: Signer[],
) => {
  let hash: `0x${string}` = "0x";

  for (const signer of signers) {
    hash = keccak256(
      encodePacked(
        ["bytes32", "uint256"],
        [
          keccak256(
            encodePacked(
              ["bytes32", "uint256"],
              [
                encodePacked(
                  ["uint96", "address"],
                  [signer.weight, signer.address],
                ),
                threshold,
              ],
            ),
          ),
          checkpoint,
        ],
      ),
    );
  }

  return hash;
};
