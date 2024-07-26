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

import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { assert, describe, test } from "matchstick-as/assembly/index";

// From: https://github.com/LimeChain/demo-subgraph/blob/f43cb41a6bae431ac7f014eab8dbad1a4f13f041/tests/asserts.test.ts
// License: MIT

// The following tests are meant to check the assert functions work as expected
// Currently there's no way to test the exact message printed by the assert functions
// But we can observe it printed in the console when running the tests
describe("Asserts", () => {
  test("with default message", () => {
    assert.equals(ethereum.Value.fromI32(1), ethereum.Value.fromI32(1));
    assert.addressEquals(Address.zero(), Address.zero());
    assert.bytesEquals(Bytes.fromUTF8("0x123"), Bytes.fromUTF8("0x123"));
    assert.i32Equals(1, 1);
    assert.bigIntEquals(BigInt.fromI32(1), BigInt.fromI32(1));
    assert.booleanEquals(true, true);
    assert.stringEquals("1", "1");
    assert.arrayEquals(
      [ethereum.Value.fromI32(1)],
      [ethereum.Value.fromI32(1)],
    );
    assert.tupleEquals(
      changetype<ethereum.Tuple>([ethereum.Value.fromI32(1)]),
      changetype<ethereum.Tuple>([ethereum.Value.fromI32(1)]),
    );
    assert.assertTrue(true);
    assert.assertNull(null);
    assert.assertNotNull("not null");
  });

  test("with custom message", () => {
    assert.equals(
      ethereum.Value.fromI32(1),
      ethereum.Value.fromI32(1),
      "Value should equal 1",
    );
    assert.addressEquals(
      Address.zero(),
      Address.zero(),
      "Address should be zero",
    );
    assert.bytesEquals(
      Bytes.fromUTF8("0x123"),
      Bytes.fromUTF8("0x123"),
      "Bytes should be equal",
    );
    assert.i32Equals(2, 2, "I32 should equal 2");
    assert.bigIntEquals(
      BigInt.fromI32(1),
      BigInt.fromI32(1),
      "BigInt should equal 1",
    );
    assert.booleanEquals(true, true, "Boolean should be true");
    assert.stringEquals("1", "1", "String should equal 1");
    assert.arrayEquals(
      [ethereum.Value.fromI32(1)],
      [ethereum.Value.fromI32(1)],
      "Arrays should be equal",
    );
    assert.tupleEquals(
      changetype<ethereum.Tuple>([ethereum.Value.fromI32(1)]),
      changetype<ethereum.Tuple>([ethereum.Value.fromI32(1)]),
      "Tuples should be equal",
    );
    assert.assertTrue(true, "Should be true");
    assert.assertNull(null, "Should be null");
    assert.assertNotNull("not null", "Should be not null");
  });
});
