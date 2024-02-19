// Copyright 2023-2024 Light, Inc.
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

import { encodeFunctionData } from "viem";

const abiItem = {
  stateMutability: "nonpayable",
  type: "function",
  inputs: [
    { name: "dest", internalType: "address", type: "address" },
    { name: "value", internalType: "uint256", type: "uint256" },
    { name: "func", internalType: "bytes", type: "bytes" },
  ],
  name: "execute",
  outputs: [],
};

const encodeDepositCalldata = () => {
  return encodeFunctionData({
    abi: [abiItem],
    functionName: "execute",
    args: [
      // The verifying pamaster addr
      "0x0000000000ffe8b47b3e2130213b802212439497",
      // The value of ETH
      BigInt(1_000_000),
      // `deposit()` in calldata
      "0xd0e30db0",
    ],
  });
};

// Run the encoding
console.log(encodeDepositCalldata());
