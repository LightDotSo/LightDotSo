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

export function decodeNonce(originalNonce: BigInt): BigInt {
  return originalNonce.bitAnd(
    BigInt.fromI32(2).pow(64).minus(BigInt.fromI32(1)),
  );
}

export function decodeNonceKey(originalNonce: BigInt): Bytes {
  const shifted = originalNonce.rightShift(64);
  const hexString = shifted.toHexString().slice(2);

  return Bytes.fromHexString(hexString) as Bytes;
}
