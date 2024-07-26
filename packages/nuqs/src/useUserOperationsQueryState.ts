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

import type { UserOperation } from "@lightdotso/schemas";
import { createParser, useQueryState } from "nuqs";

// -----------------------------------------------------------------------------
// Parser
// -----------------------------------------------------------------------------

export const userOperationsParser = createParser({
  parse: (value) => {
    const operations = value.split(";");
    return operations?.map<Partial<UserOperation>>((operation) => {
      const [
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _index,
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
  serialize: (value: Array<Partial<UserOperation>>) =>
    value
      ?.map(
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
      .join(";"),
});

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useUserOperationsQueryState = (
  defaultUserOperations?: Array<Partial<UserOperation>>,
) => {
  return useQueryState(
    "userOperations",
    userOperationsParser.withDefault(defaultUserOperations ?? []).withOptions({
      throttleMs: 3000,
    }),
  );
};
