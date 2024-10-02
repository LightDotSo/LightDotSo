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

import { type Hex, fromBytes, fromHex, toHex } from "viem";
import { describe, expect, it } from "vitest";
import {
  decodePackedPaymasterAndData,
  decodePaymasterAndData,
  encodePackedPaymasterAndData,
  toHexPadded,
} from "../src";

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

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

  it("should decode paymaster and data for test case 'pimlico'", () => {
    const expectedMsg =
      "0xe3dc822d77f8ca7ac74c30b0dffea9fcdcaaa32100000000000000000000000000000000000000000000000000000000668402bc00000000000000000000000000000000000000000000000000000000000000009103b16eef142ff044288bc9c89812c5656a246a466cd024e7a86bc0eac13ee17f356f203dc99326d5ae0b7e7dd65df065bbf4dff0251c54952eaa2874d8a0571c" as Hex;

    const [address, validUntil, validAfter, signature] = decodePaymasterAndData(
      fromHex(expectedMsg, "bytes"),
    )._unsafeUnwrap();

    expect(address).toBe("0xe3dc822d77f8ca7ac74c30b0dffea9fcdcaaa321");
    expect(validUntil).toBe(0x668402bc);
    expect(validAfter).toBe(0);
    expect(toHex(signature)).toBe(
      "0x9103b16eef142ff044288bc9c89812c5656a246a466cd024e7a86bc0eac13ee17f356f203dc99326d5ae0b7e7dd65df065bbf4dff0251c54952eaa2874d8a0571c",
    );
  });

  it("should decode paymaster and data for test case 'alchemy'", () => {
    const expectedMsg =
      "0x4fd9098af9ddcb41da48a1d78f91f1398965addc00000000000000006685d0520000000000000000000000000000000000000000bab40d3c364ad63d5bcf59da8a8c872a2c6f2aad81a4bd8b46812e16271855115b9d6479508ad438ad247884664ef7cb40cbc1898891f08da75509df37e089051c" as Hex;

    const [address, validUntil, validAfter, signature] = decodePaymasterAndData(
      fromHex(expectedMsg, "bytes"),
    )._unsafeUnwrap();

    expect(address).toBe("0x4fd9098af9ddcb41da48a1d78f91f1398965addc");
    expect(validUntil).toBe(0x6685d052);
    expect(validAfter).toBe(0);
    // Convert the signature bytes to a hex string for comparison
    expect(toHex(signature)).toBe(
      "0xbab40d3c364ad63d5bcf59da8a8c872a2c6f2aad81a4bd8b46812e16271855115b9d6479508ad438ad247884664ef7cb40cbc1898891f08da75509df37e089051c",
    );
  });
});

describe("decodePackedPaymasterAndData", () => {
  it("should return null values for '0x' input", () => {
    const result = decodePackedPaymasterAndData("0x" as Hex);
    expect(result).toEqual({
      paymaster: "0x",
      paymasterVerificationGasLimit: 0n,
      paymasterPostOpGasLimit: 0n,
      paymasterData: "0x",
    });
  });

  it("should correctly decode a valid packed paymaster and data", () => {
    const paymaster = "0x1234567890123456789012345678901234567890";
    const verificationGasLimit = 1000000n;
    const postOpGasLimit = 500000n;
    const paymasterData = "0xabcdef";

    const packedData = encodePackedPaymasterAndData(
      paymaster,
      verificationGasLimit,
      postOpGasLimit,
      paymasterData,
    );

    const result = decodePackedPaymasterAndData(packedData);

    expect(result).toEqual({
      paymaster: paymaster as Hex,
      paymasterVerificationGasLimit: verificationGasLimit,
      paymasterPostOpGasLimit: postOpGasLimit,
      paymasterData: paymasterData as Hex,
    });
  });
});

describe("encodePackedPaymasterAndData Tests", () => {
  it("should correctly pack valid inputs", () => {
    const paymaster = "0x1234567890123456789012345678901234567890" as Hex;
    const verificationGasLimit = 1000000n;
    const postOpGasLimit = 500000n;
    const paymasterData = "0xabcdef" as Hex;

    const result = encodePackedPaymasterAndData(
      paymaster,
      verificationGasLimit,
      postOpGasLimit,
      paymasterData,
    );

    const expected = `0x1234567890123456789012345678901234567890${toHexPadded(verificationGasLimit, 16)}${toHexPadded(postOpGasLimit, 16)}abcdef`;
    expect(result).toBe(expected);
  });
});

describe("full decode/encode packedPaymasterAndData", () => {
  it("should correctly decode and encode a valid packed paymaster and data", () => {
    const paymaster = "0x1234567890123456789012345678901234567890" as Hex;
    const verificationGasLimit = 1000000n;
    const postOpGasLimit = 500000n;
    const paymasterData = "0xabcdef" as Hex;

    const packedData = encodePackedPaymasterAndData(
      paymaster,
      verificationGasLimit,
      postOpGasLimit,
      paymasterData,
    );

    const decodedData = decodePackedPaymasterAndData(packedData);

    expect(decodedData).toEqual({
      paymaster: paymaster,
      paymasterVerificationGasLimit: verificationGasLimit,
      paymasterPostOpGasLimit: postOpGasLimit,
      paymasterData: paymasterData,
    });
  });
});
