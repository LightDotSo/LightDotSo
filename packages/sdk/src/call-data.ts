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

import type { Execution } from "@lightdotso/types";
import {
  type Address,
  type Hex,
  decodeAbiParameters,
  toFunctionSelector,
} from "viem";

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

export const decodeCallDataToExecution = (
  callData: Hex,
): {
  executions: Execution[];
} => {
  // Check if all required parameters are provided and valid
  if (!callData || callData === "0x") {
    return {
      executions: [],
    };
  }

  // Get the function selector (first 4 bytes)
  const selector = callData.slice(0, 10);

  // Decode the calldata based on the function
  if (
    selector ===
    toFunctionSelector({
      type: "function",
      inputs: [
        { name: "dest", internalType: "address", type: "address" },
        { name: "value", internalType: "uint256", type: "uint256" },
        { name: "func", internalType: "bytes", type: "bytes" },
      ],
      name: "execute",
      outputs: [],
      stateMutability: "nonpayable",
    })
  ) {
    const [to, value, data] = decodeAbiParameters(
      [
        { name: "dest", internalType: "address", type: "address" },
        { name: "value", internalType: "uint256", type: "uint256" },
        { name: "func", internalType: "bytes", type: "bytes" },
      ],
      callData.slice(10) as Hex,
    );

    return {
      executions: [
        {
          address: to as Address,
          value: value,
          callData: data as Hex,
        },
      ],
    };
  }

  if (
    selector ===
    toFunctionSelector({
      type: "function",
      inputs: [
        { name: "dest", internalType: "address[]", type: "address[]" },
        { name: "value", internalType: "uint256[]", type: "uint256[]" },
        { name: "func", internalType: "bytes[]", type: "bytes[]" },
      ],
      name: "executeBatch",
      outputs: [],
      stateMutability: "nonpayable",
    })
  ) {
    const [tos, values, datas] = decodeAbiParameters(
      [
        { name: "dest", internalType: "address[]", type: "address[]" },
        { name: "value", internalType: "uint256[]", type: "uint256[]" },
        { name: "func", internalType: "bytes[]", type: "bytes[]" },
      ],
      callData.slice(10) as Hex,
    );

    return {
      executions: tos.map((to, index) => ({
        address: to as Address,
        value: values[index],
        callData: datas[index] as Hex,
      })),
    };
  }

  // If the selector is not recognized, return an empty array
  return {
    executions: [],
  };
};
