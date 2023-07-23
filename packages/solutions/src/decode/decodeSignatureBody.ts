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
