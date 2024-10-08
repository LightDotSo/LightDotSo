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
import { BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import { assert, test } from "matchstick-as/assembly/index";
import { decodeNonce, decodeNonceKey } from "../src/nonce";

// From: https://thegraph.com/docs/en/developing/unit-testing-framework

test("decodeNonce: Basic test", () => {
  // 2^64 so should be 0
  const originalNonce = BigInt.fromString("18446744073709551616");
  const result = decodeNonce(originalNonce);
  assert.bigIntEquals(BigInt.fromI32(0), result);
});

test("decodeNonce: Max u64 value", () => {
  // 2^64 - 1 so should be 18446744073709551615
  const maxU64 = BigInt.fromString("18446744073709551615");
  const result = decodeNonce(maxU64);
  assert.bigIntEquals(maxU64, result);
});

test("decodeNonce: Max uint256 value", () => {
  const bytes = Bytes.fromHexString(
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
  ) as Bytes;
  // Convert Bytes to BigInt
  const largeNumber = BigInt.fromUnsignedBytes(bytes);
  const result = decodeNonce(largeNumber);
  assert.bigIntEquals(BigInt.fromString("18446744073709551615"), result);
});

test("Basic test", () => {
  // 2^64 so should be 1
  const originalNonce = BigInt.fromString("18446744073709551616");
  const result = decodeNonceKey(originalNonce);
  assert.bytesEquals(
    Bytes.fromHexString(
      "0x000000000000000000000000000000000000000000000001",
    ) as Bytes,
    result,
  );
  assert.assertTrue(result.toHexString().length === 50);
});

test("Max u64 value", () => {
  // 2^64 - 1 so should be 0
  const maxU64 = BigInt.fromString("18446744073709551615");
  const result = decodeNonceKey(maxU64);
  assert.bytesEquals(
    Bytes.fromHexString(
      "0x000000000000000000000000000000000000000000000000",
    ) as Bytes,
    result,
  );
  log.info("result", [result.toHexString()]);
  assert.assertTrue(result.toHexString().length === 50);
});

test("Max uint256 value", () => {
  // 2^256 - 1 so should be 0xffffffffffffffffffffffffffffffffffffffffffffffff
  const bytes = Bytes.fromHexString(
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
  ) as Bytes;
  const largeNumber = BigInt.fromUnsignedBytes(bytes);
  const result = decodeNonceKey(largeNumber);
  assert.bytesEquals(
    Bytes.fromHexString(
      "0xffffffffffffffffffffffffffffffffffffffffffffffff",
    ) as Bytes,
    result,
  );
  assert.assertTrue(result.toHexString().length === 50);
});
