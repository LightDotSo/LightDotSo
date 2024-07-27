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

import { type Result, err, ok } from "neverthrow";
import { type Address, fromBytes } from "viem";

// Define the Alchemy v0.6.0 Gas Manager address
export const ALCHEMY_V060_GAS_MANAGER_ADDRESS: Address =
  "0x4Fd9098af9ddcB41DA48A1d78F91F1398965addc";

export const decodePaymasterAndData = (
  msg: Uint8Array,
): Result<[Address, number, number, Uint8Array], string> => {
  // Helper function to check if a timestamp is valid
  function isValidTimestamp(timestamp: number): boolean {
    return !Number.isNaN(new Date(timestamp * 1000).getTime());
  }

  // Extract the paymaster address from the message
  const verifyingPaymasterAddress: Address = `0x${Buffer.from(msg.subarray(0, 20)).toString("hex")}`;

  // Check if the address matches the predefined address (assuming it's a constant)
  if (verifyingPaymasterAddress === ALCHEMY_V060_GAS_MANAGER_ADDRESS) {
    // Extract the valid until timestamp
    const validUntil = fromBytes(msg.subarray(28, 32), "number");
    const validAfter = 0; // Set valid after to 0 as per the logic
    const signature = msg.subarray(52); // Extract the signature

    // Validate the timestamp
    if (!isValidTimestamp(validUntil)) {
      return err("Invalid timestamp");
    }

    return ok([verifyingPaymasterAddress, validUntil, validAfter, signature]);
  }

  // For other addresses, extract timestamps and signature differently
  const validUntil = fromBytes(msg.subarray(44, 52), "number");

  const validAfter = fromBytes(msg.subarray(76, 84), "number");
  const signature = msg.subarray(84);

  // Validate both timestamps
  if (!(isValidTimestamp(validUntil) && isValidTimestamp(validAfter))) {
    return err("Invalid timestamp");
  }

  return ok([verifyingPaymasterAddress, validUntil, validAfter, signature]);
};
