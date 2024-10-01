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
import {
  type Address,
  type Hex,
  fromBytes,
  isAddress,
  isAddressEqual,
} from "viem";
import { fromHex } from "viem/utils";
import { toHexPadded } from "./utils";

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

// Define the Alchemy v0.6.0 Gas Manager address
export const ALCHEMY_V060_GAS_MANAGER_ADDRESS: Address =
  "0x4Fd9098af9ddcB41DA48A1d78F91F1398965addc";

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

export const decodePaymasterAndData = (
  msg: Uint8Array,
): Result<[Address, number, number, Uint8Array], string> => {
  // Helper function to check if a timestamp is valid
  function isValidTimestamp(timestamp: number): boolean {
    return !Number.isNaN(new Date(timestamp).getTime());
  }

  // Extract the paymaster address from the message
  const verifyingPaymasterAddress: Address = `0x${Buffer.from(msg.subarray(0, 20)).toString("hex")}`;

  // Check if the address matches the predefined address (assuming it's a constant)
  if (
    isAddressEqual(verifyingPaymasterAddress, ALCHEMY_V060_GAS_MANAGER_ADDRESS)
  ) {
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

export function decodePackedPaymasterAndData(paymasterAndData: Hex): {
  paymaster: Hex | null | undefined;
  paymasterVerificationGasLimit: bigint | null | undefined;
  paymasterPostOpGasLimit: bigint | null | undefined;
  paymasterData: Hex | null | undefined;
} {
  if (paymasterAndData === "0x" || paymasterAndData.slice(2).length < 104) {
    return {
      paymaster: null,
      paymasterVerificationGasLimit: null,
      paymasterPostOpGasLimit: null,
      paymasterData: null,
    };
  }

  const paymaster = `0x${paymasterAndData.slice(2).slice(0, 40)}` as Hex;
  const paymasterVerificationGasLimit = fromHex(
    `0x${paymasterAndData.slice(2).slice(40, 72)}`,
    "bigint",
  );
  const paymasterPostOpGasLimit = fromHex(
    `0x${paymasterAndData.slice(2).slice(72, 104)}`,
    "bigint",
  );
  const paymasterData = `0x${paymasterAndData.slice(2).slice(104)}` as Hex;

  return {
    paymaster,
    paymasterVerificationGasLimit,
    paymasterPostOpGasLimit,
    paymasterData,
  };
}

export function encodePackedPaymasterAndData(
  paymaster: Hex | null | undefined,
  paymasterVerificationGasLimit: bigint | null | undefined,
  paymasterPostOpGasLimit: bigint | null | undefined,
  paymasterData: Hex | null | undefined,
): Hex {
  // Check if all required parameters are provided and valid
  if (
    !paymaster ||
    paymaster === "0x" ||
    !isAddress(paymaster) ||
    !paymasterVerificationGasLimit ||
    typeof paymasterVerificationGasLimit === "undefined" ||
    !paymasterPostOpGasLimit ||
    typeof paymasterPostOpGasLimit === "undefined" ||
    !paymasterData ||
    paymasterData === "0x"
  ) {
    return "0x";
  }

  // Process each component
  const paymasterHex = paymaster?.slice(2);
  const verificationGasLimitHex = toHexPadded(
    paymasterVerificationGasLimit,
    16,
  );
  const postOpGasLimitHex = toHexPadded(paymasterPostOpGasLimit, 16);
  const paymasterDataHex = paymasterData.slice(2);

  // Combine all components
  return `0x${paymasterHex}${verificationGasLimitHex}${postOpGasLimitHex}${paymasterDataHex}`;
}
