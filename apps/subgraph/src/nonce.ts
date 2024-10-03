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

// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
// biome-ignore lint/style/useImportType: <explanation>
import { BigInt, Bytes } from "@graphprotocol/graph-ts";

// From: https://thegraph.com/docs/en/developing/graph-ts/api/#bigint
// BigInt in assemblyscript is from Ethereum values of type uint32 to uint256

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

export function decodeNonce(originalNonce: BigInt): BigInt {
  // 2^64 - 1 (max value for uint64)
  const mask = BigInt.fromString("18446744073709551615");
  return originalNonce.bitAnd(mask);
}

export function decodeNonceKey(originalNonce: BigInt): Bytes {
  // Convert to hex and remove '0x' prefix
  let hexString = originalNonce.toHexString().slice(2);

  // Pad to 64 characters (32 bytes) to ensure we have enough digits
  hexString = hexString.padStart(64, "0");

  // Take the first 48 characters (24 bytes) which represent the upper 192 bits
  const upperBitsHex = hexString.slice(0, 48);

  return Bytes.fromHexString(upperBitsHex) as Bytes;
}
