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

import type { UserOperation } from "@lightdotso/schemas";
import { createParser, useQueryState } from "nuqs";

// -----------------------------------------------------------------------------
// Parser
// -----------------------------------------------------------------------------

export const userOperationsParser = createParser({
  parse(value) {
    const operations = value.split(";");
    return operations.map<Partial<UserOperation>>(operation => {
      const [
        chainId,
        hash,
        nonce,
        initCode,
        sender,
        callData,
        callGasLimit,
        verificationGasLimit,
        preVerificationGas,
        maxFeePerGas,
        maxPriorityFeePerGas,
        paymasterAndData,
        signature,
      ] = operation.split(":");

      const parsedOp: Partial<UserOperation> = {};

      if (chainId !== "_") {
        parsedOp.chainId = BigInt(chainId);
      }

      if (hash !== "_") {
        parsedOp.hash = hash;
      }

      if (nonce !== "_") {
        parsedOp.nonce = BigInt(nonce);
      }

      if (initCode !== "_") {
        parsedOp.initCode = initCode;
      }

      if (sender !== "_") {
        parsedOp.sender = sender;
      }

      if (callData !== "_") {
        parsedOp.callData = callData;
      }

      if (callGasLimit !== "_") {
        parsedOp.callGasLimit = BigInt(callGasLimit);
      }

      if (verificationGasLimit !== "_") {
        parsedOp.verificationGasLimit = BigInt(verificationGasLimit);
      }

      if (preVerificationGas !== "_") {
        parsedOp.preVerificationGas = BigInt(preVerificationGas);
      }

      if (maxFeePerGas !== "_") {
        parsedOp.maxFeePerGas = BigInt(maxFeePerGas);
      }

      if (maxPriorityFeePerGas !== "_") {
        parsedOp.maxPriorityFeePerGas = BigInt(maxPriorityFeePerGas);
      }

      if (paymasterAndData !== "_") {
        parsedOp.paymasterAndData = paymasterAndData;
      }

      if (signature !== "_") {
        parsedOp.signature = signature;
      }

      return parsedOp;
    });
  },
  serialize(value: Array<Partial<UserOperation>>) {
    return value
      .map(
        (operation, i) =>
          `${i}:${operation.chainId?.toString() ?? "_"}:${
            operation.hash ?? "_"
          }:${operation.nonce?.toString() ?? "_"}:${
            operation.initCode ?? "_"
          }:${operation.sender ?? "_"}:${operation.callData ?? "_"}:${
            operation.callGasLimit?.toString() ?? "_"
          }:${operation.verificationGasLimit?.toString() ?? "_"}:${
            operation.preVerificationGas?.toString() ?? "_"
          }:${operation.maxFeePerGas?.toString() ?? "_"}:${
            operation.maxPriorityFeePerGas?.toString() ?? "_"
          }:${operation.paymasterAndData ?? "_"}:${operation.signature ?? "_"}`,
      )
      .join(";");
  },
});

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useUserOperationsQueryState = () => {
  return useQueryState("userOperations", userOperationsParser.withDefault([]));
};
