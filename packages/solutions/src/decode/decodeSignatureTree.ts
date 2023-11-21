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

// Decode the signature tree.
// From: https://github.com/0xsequence/sequence.js/blob/3fa8067a5df6332784501794a90af583254e5b88/packages/core/src/v2/signature.ts#L67-L195
// License: Apache 2.0

import { bytesToString, bytesToHex } from "viem";
import type { RecoveryNode, RecoveryTopology } from "../typings";
import { SignaturePartType } from "../typings";

export const SignaturePartTypeLength = 66;

export const decodeSignatureTree = (bytes: Uint8Array): RecoveryTopology => {
  let pointer: undefined | RecoveryNode;

  // Append a node to the pointer.
  const append = (
    prevPointer: typeof pointer,
    node: RecoveryTopology,
  ): typeof pointer => {
    // If there is no pointer, create a new pointer.
    // Default to the left node.
    if (!prevPointer) {
      return {
        left: node,
        right: undefined,
      };
    }

    // If there is no right node, add the node to the right.
    if (!prevPointer.right) {
      return {
        left: prevPointer.left,
        right: node,
      };
    }

    // If there is a right node, move up the tree, and append the node to the right.
    return {
      left: prevPointer,
      right: node,
    };
  };

  while (bytes.length > 0) {
    const type = bytes[0];

    bytes = bytes.slice(1);

    switch (type) {
      case SignaturePartType.Address:
        {
          // Get the weight and address.
          // uint8 addrWeight; address addr;
          // From: https://github.com/0xsequence/wallet-contracts/blob/e0c5382636a88b4db4bcf0a70623355d7cd30fb4/contracts/modules/commons/submodules/auth/SequenceBaseSig.sol#L119-L121
          const weight = bytes[0];
          const address = bytesToString(bytes.slice(1, 21));

          // Trim the address off the bytes. 21 bytes for address.
          bytes = bytes.slice(21);

          // Append to the pointer.
          pointer = append(pointer, {
            address,
            weight: BigInt(weight),
          });
        }
        break;
      case SignaturePartType.Signature:
        {
          // Get the weight and signature.
          // uint8 addrWeight;
          // uint256 nrindex = rindex + 66;
          // From: https://github.com/0xsequence/wallet-contracts/blob/e0c5382636a88b4db4bcf0a70623355d7cd30fb4/contracts/modules/commons/submodules/auth/SequenceBaseSig.sol#L130-L136
          const weight = bytes[0];
          const signature = bytes.slice(1, SignaturePartTypeLength + 1);

          // Trim the signature off the bytes. // 67 bytes for signature.
          bytes = bytes.slice(SignaturePartTypeLength + 1);

          // Append to the pointer.
          pointer = append(pointer, {
            signature: bytesToHex(signature),
            weight: BigInt(weight),
          });
        }
        break;
      case SignaturePartType.DynamicSignature:
        {
          // Get the weight, address, and signature.
          // uint8 addrWeight; address addr;
          // uint256 size;
          // uint256 nrindex = rindex + size;
          // From: https://github.com/0xsequence/wallet-contracts/blob/e0c5382636a88b4db4bcf0a70623355d7cd30fb4/contracts/modules/commons/submodules/auth/SequenceBaseSig.sol#L148-L172
          const weight = bytes[0];
          const address = bytesToString(bytes.slice(1, 21));
          const size = (bytes[21] << 16) | (bytes[22] << 8) | bytes[23];
          const signature = bytes.slice(24, 24 + size);

          // Trim the signature off the bytes. 24 + size bytes for address and signature size.
          bytes = bytes.slice(24 + size);

          // Append to the pointer.
          pointer = append(pointer, {
            address,
            signature: bytesToHex(signature),
            weight: BigInt(weight),
          });
        }
        break;

      case SignaturePartType.Node:
        {
          // Get the hash.
          // bytes32 node;
          // From: https://github.com/0xsequence/wallet-contracts/blob/e0c5382636a88b4db4bcf0a70623355d7cd30fb4/contracts/modules/commons/submodules/auth/SequenceBaseSig.sol#L173-L179
          const nodeHash = bytes.slice(0, 32);

          // Trim the hash off the bytes. 32 bytes for hash.
          bytes = bytes.slice(32);

          // Append to the pointer.
          pointer = append(pointer, { nodeHash: bytesToString(nodeHash) });
        }
        break;
      case SignaturePartType.Branch:
        {
          // Get the branch.
          // uint256 size;
          // uint256 nweight; bytes32 node;
          // From: https://github.com/0xsequence/wallet-contracts/blob/e0c5382636a88b4db4bcf0a70623355d7cd30fb4/contracts/modules/commons/submodules/auth/SequenceBaseSig.sol#L181-L196
          const size = (bytes[0] << 16) | (bytes[1] << 8) | bytes[2];
          const branch = decodeSignatureTree(bytes.slice(3, 3 + size));

          // Trim the branch off the bytes. 3 + size bytes for branch size.
          bytes = bytes.slice(3 + size);

          // Append to the pointer.
          pointer = append(pointer, branch);
        }
        break;
      case SignaturePartType.Nested:
        {
          // Get the weight, threshold, and tree.
          // uint256 externalWeight;
          // uint256 internalThreshold;
          // uint256 size;
          // From: https://github.com/0xsequence/wallet-contracts/blob/e0c5382636a88b4db4bcf0a70623355d7cd30fb4/contracts/modules/commons/submodules/auth/SequenceBaseSig.sol#L197-L222
          const weight = bytes[0];
          const threshold = (bytes[1] << 8) | bytes[2];
          const size = (bytes[3] << 16) | (bytes[4] << 8) | bytes[5];

          // Recursively decode the tree.
          const tree = decodeSignatureTree(bytes.slice(6, 6 + size));

          // Trim the tree off the bytes. 6 + size bytes for tree size.
          bytes = bytes.slice(6 + size);

          // Append to the pointer.
          pointer = append(pointer, {
            weight: BigInt(weight),
            threshold: BigInt(threshold),
            tree,
          });
        }
        break;
      case SignaturePartType.Subdigest:
        {
          // Get the subdigest.
          // bytes32 hardcoded;
          // From: https://github.com/0xsequence/wallet-contracts/blob/e0c5382636a88b4db4bcf0a70623355d7cd30fb4/contracts/modules/commons/submodules/auth/SequenceBaseSig.sol#L224-L236
          const subdigest = bytes.slice(0, 32);

          // Trim the hash off the bytes. 32 bytes for subdigest.
          bytes = bytes.slice(32);

          // Append to the pointer.
          pointer = append(pointer, { subdigest: bytesToString(subdigest) });
        }
        break;
      default:
        throw new Error(`Unknown signature part type: ${type}`);
    }
  }

  // If there is no pointer, throw an error.
  if (!pointer) {
    throw new Error("Empty signature tree");
  }

  // If there is a right node, return the pointer.
  if (pointer.right) {
    return pointer as Required<typeof pointer>;
  }

  // If there is no right node, return the left node.
  return pointer.left;
};
