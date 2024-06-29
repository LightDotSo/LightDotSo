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

// Copyright 2017-present Horizon Blockchain Games Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { decodeSignatureTree } from "./decodeSignatureTree";
// Decode the body of a signature.
// From: https://github.com/0xsequence/sequence.js/blob/3fa8067a5df6332784501794a90af583254e5b88/packages/core/src/v2/signature.ts#L554-L563
// License: Apache 2.0
export const decodeSignatureBody = (bytes: Uint8Array) => {
  // Threshold is the first 2 bytes (uint16)
  // LibBytes.readFirstUint16(_signature);
  // https://github.com/0xsequence/wallet-contracts/blob/e0c5382636a88b4db4bcf0a70623355d7cd30fb4/contracts/modules/commons/submodules/auth/SequenceBaseSig.sol#L269
  const threshold = (bytes[0] << 8) | bytes[1];

  // Checkpoint is the next 4 bytes (uint32) or slots 2-5
  // LibBytes.readUint32(_signature, 2);
  // https://github.com/0xsequence/wallet-contracts/blob/e0c5382636a88b4db4bcf0a70623355d7cd30fb4/contracts/modules/commons/submodules/auth/SequenceBaseSig.sol#L270
  const checkpoint =
    (bytes[2] << 24) | (bytes[3] << 16) | (bytes[4] << 8) | bytes[5];

  const tree = decodeSignatureTree(bytes.slice(6));

  // Return the threshold and checkpoint in a BigInt format.
  return {
    threshold: BigInt(threshold),
    checkpoint: BigInt(checkpoint),
    tree: tree,
  };
};
