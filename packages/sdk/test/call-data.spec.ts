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

import { type Hex, encodeAbiParameters, toFunctionSelector } from "viem";
import { describe, expect, it } from "vitest";
import { decodeCallDataToExecution } from "../src";

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe("decodeCallDataToExecution Tests", () => {
  it("should return empty executions for null callData", () => {
    const callData = "0x" as Hex;
    const result = decodeCallDataToExecution(callData);
    expect(result).toEqual({
      executions: [],
    });
  });

  it("should return empty executions for empty callData", () => {
    const callData = "0x";
    const result = decodeCallDataToExecution(callData);
    expect(result).toEqual({
      executions: [],
    });
  });

  it("should correctly decode execute function callData", () => {
    const selector = toFunctionSelector({
      type: "function",
      inputs: [
        { name: "dest", internalType: "address", type: "address" },
        { name: "value", internalType: "uint256", type: "uint256" },
        { name: "func", internalType: "bytes", type: "bytes" },
      ],
      name: "execute",
      outputs: [],
      stateMutability: "nonpayable",
    });

    const params = encodeAbiParameters(
      [
        { name: "dest", internalType: "address", type: "address" },
        { name: "value", internalType: "uint256", type: "uint256" },
        { name: "func", internalType: "bytes", type: "bytes" },
      ],
      [
        "0x1234567890123456789012345678901234567890",
        BigInt(1000000000000000000),
        "0xabcdef",
      ],
    );

    const callData = `${selector}${params.slice(2)}` as Hex;

    const result = decodeCallDataToExecution(callData);

    expect(result).toEqual({
      executions: [
        {
          address: "0x1234567890123456789012345678901234567890",
          value: BigInt(1000000000000000000),
          callData: "0xabcdef",
        },
      ],
    });
  });

  it("should correctly decode executeBatch function callData", () => {
    const selector = toFunctionSelector({
      type: "function",
      inputs: [
        { name: "dest", internalType: "address[]", type: "address[]" },
        { name: "value", internalType: "uint256[]", type: "uint256[]" },
        { name: "func", internalType: "bytes[]", type: "bytes[]" },
      ],
      name: "executeBatch",
      outputs: [],
      stateMutability: "nonpayable",
    });

    const params = encodeAbiParameters(
      [
        { name: "dest", internalType: "address[]", type: "address[]" },
        { name: "value", internalType: "uint256[]", type: "uint256[]" },
        { name: "func", internalType: "bytes[]", type: "bytes[]" },
      ],
      [
        [
          "0x1234567890123456789012345678901234567890",
          "0x0987654321098765432109876543210987654321",
        ],
        [BigInt(1000000000000000000), BigInt(2000000000000000000)],
        ["0xabcdef", "0x123456"],
      ],
    );

    const callData = `${selector}${params.slice(2)}` as Hex;

    const result = decodeCallDataToExecution(callData);

    expect(result).toEqual({
      executions: [
        {
          address: "0x1234567890123456789012345678901234567890",
          value: BigInt(1000000000000000000),
          callData: "0xabcdef",
        },
        {
          address: "0x0987654321098765432109876543210987654321",
          value: BigInt(2000000000000000000),
          callData: "0x123456",
        },
      ],
    });
  });

  it("should return empty executions for unrecognized selector", () => {
    const callData = "0x1234567890abcdef";
    const result = decodeCallDataToExecution(callData);
    expect(result).toEqual({
      executions: [],
    });
  });
});
