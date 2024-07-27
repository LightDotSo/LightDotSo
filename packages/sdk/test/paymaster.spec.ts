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

import { type Hex, fromBytes, fromHex } from "viem";
import { describe, expect, it } from "vitest";
import { decodePaymasterAndData } from "../src/paymaster";

describe("decodePaymasterAndData Tests", () => {
  it("should decode paymaster and data correctly", () => {
    const expectedMsg =
      "0x0dcd1bf9a1b36ce34237eeafef220931846bcd8200000000000000000000000000000000000000000000000000000000deadbeef0000000000000000000000000000000000000000000000000000000000001234dd74227f0b9c29afe4ffa17a1d0076230f764cf3cb318a4e670a47e9cd97e6b75ee38c587228a59bb37773a89066a965cc210c49891a662af5f14e9e5e74d6a51c" as Hex;

    const [address, validUntil, validAfter, signature] = decodePaymasterAndData(
      fromHex(expectedMsg, "bytes"),
    )._unsafeUnwrap();

    expect(address).toBe("0x0dcd1bf9a1b36ce34237eeafef220931846bcd82");
    expect(validUntil).toBe(0xdeadbeef);
    expect(validAfter).toBe(0x1234);
    expect(fromBytes(signature, "hex")).toBe(
      "0xdd74227f0b9c29afe4ffa17a1d0076230f764cf3cb318a4e670a47e9cd97e6b75ee38c587228a59bb37773a89066a965cc210c49891a662af5f14e9e5e74d6a51c",
    );
  });
});
