// Copyright 2023-2024 Light
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

import { type Hex, encodePacked, keccak256 } from "viem";

export const hashSetImageHash = (image_hash: Hex) => {
  return keccak256(
    encodePacked(
      ["bytes32", "bytes32"],
      [
        // Hash of `SetImageHash(bytes32 imageHash)`
        "0x8713a7c4465f6fbee2b6e9d6646d1d9f83fec929edfc4baf661f3c865bdd04d1",
        image_hash,
      ],
    ),
  );
};
