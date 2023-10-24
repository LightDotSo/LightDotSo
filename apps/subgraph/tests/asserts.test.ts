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

import { describe, test, assert } from "matchstick-as";
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";

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
