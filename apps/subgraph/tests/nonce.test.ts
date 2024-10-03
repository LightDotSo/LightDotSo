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
import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { assert, test } from "matchstick-as/assembly/index";
import { decodeNonce, decodeNonceKey } from "../src/nonce";

// From: https://thegraph.com/docs/en/developing/unit-testing-framework

test("decodeNonce and decodeNonceKey: Basic test with small numbers", () => {
  const originalNonce = BigInt.fromI32(256);
  const resultNonce = decodeNonce(originalNonce);
  const resultNonceKey = decodeNonceKey(originalNonce);

  assert.bytesEquals(
    Bytes.fromHexString(
      "000000000000000000000000000000000000000000000000",
    ) as Bytes,
    resultNonceKey,
  );
  assert.bigIntEquals(BigInt.fromI32(256), resultNonce);
});

test("decodeNonce and decodeNonceKey: Test with large number", () => {
  const originalNonce = BigInt.fromString("123456789012345678901234567890");
  const resultNonce = decodeNonce(originalNonce);
  const resultNonceKey = decodeNonceKey(originalNonce);

  assert.bytesEquals(
    Bytes.fromHexString(
      "000000000000000000000006a94d74f430000000000000",
    ) as Bytes,
    resultNonceKey,
  );
  assert.bigIntEquals(BigInt.fromString("1234567890"), resultNonce);
});

test("decodeNonce and decodeNonceKey: Test with max u64 value", () => {
  const maxU64 = BigInt.fromString("18446744073709551615");
  const resultNonce = decodeNonce(maxU64);
  const resultNonceKey = decodeNonceKey(maxU64);

  assert.bytesEquals(
    Bytes.fromHexString(
      "000000000000000000000000000000000000000000000000",
    ) as Bytes,
    resultNonceKey,
  );
  assert.bigIntEquals(maxU64, resultNonce);
});

test("decodeNonce and decodeNonceKey: Test with value larger than u64", () => {
  const originalNonce = BigInt.fromString("18446744073709551616"); // 2^64
  const resultNonce = decodeNonce(originalNonce);
  const resultNonceKey = decodeNonceKey(originalNonce);

  assert.bytesEquals(
    Bytes.fromHexString(
      "000000000000000000000000000000000000000000000001",
    ) as Bytes,
    resultNonceKey,
  );
  assert.bigIntEquals(BigInt.fromI32(0), resultNonce);
});

test("decodeNonce and decodeNonceKey: Test with max uint256 value", () => {
  const maxUint256 = BigInt.fromString(
    "115792089237316195423570985008687907853269984665640564039457584007913129639935",
  );
  const resultNonce = decodeNonce(maxUint256);
  const resultNonceKey = decodeNonceKey(maxUint256);

  assert.bytesEquals(
    Bytes.fromHexString(
      "ffffffffffffffffffffffffffffffffffffffffffffffff",
    ) as Bytes,
    resultNonceKey,
  );
  assert.bigIntEquals(BigInt.fromString("18446744073709551615"), resultNonce);
});
