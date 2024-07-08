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
