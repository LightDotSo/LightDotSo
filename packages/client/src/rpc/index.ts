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

import { ResultAsync } from "neverthrow";
import { z } from "zod";
import type { ClientType } from "../client";
import { rpcClient } from "../client";
import { zodJsonRpcFetch } from "../zod";

// -----------------------------------------------------------------------------
// Rpc
// -----------------------------------------------------------------------------

const EthChainIdResponse = z
  .string()
  // biome-ignore lint/performance/useTopLevelRegex: <explanation>
  .refine((value) => /^0x[0-9a-fA-F]+$/.test(value), {
    message: "ChainId must be a hexadecimal string",
  });

export const getChainId = async (chainId: number, clientType?: ClientType) => {
  return ResultAsync.fromPromise(
    zodJsonRpcFetch(
      rpcClient(chainId, clientType),
      "eth_chainId",
      [],
      EthChainIdResponse,
    ),
    (e) => e,
  );
};

const HexStringSchema = z
  .string()
  // biome-ignore lint/performance/useTopLevelRegex: <explanation>
  .refine((value) => /^0x[0-9a-fA-F]*$/.test(value), {
    message: "Must be a hexadecimal string",
  });

// -----------------------------------------------------------------------------
// GetUserOperation
// -----------------------------------------------------------------------------

const maxFeeGasEstimation = z.object({
  maxPriorityFeePerGas: HexStringSchema,
  maxFeePerGas: HexStringSchema,
});

const getGasEstimationResponse = z.object({
  low: maxFeeGasEstimation,
  medium: maxFeeGasEstimation,
  high: maxFeeGasEstimation,
  instant: maxFeeGasEstimation,
});

export type GasEstimationResponse = z.infer<typeof getGasEstimationResponse>;

export const getRequestGasEstimation = async (
  chainId: number,
  clientType?: ClientType,
) => {
  return ResultAsync.fromPromise(
    zodJsonRpcFetch(
      rpcClient(chainId, clientType),
      "gas_requestGasEstimation",
      [],
      getGasEstimationResponse,
    ),
    (e) => e,
  );
};

// -----------------------------------------------------------------------------
// GetUserOperation
// -----------------------------------------------------------------------------

const getUserOperationReceiptResponse = z
  .any()
  .refine((value) => typeof value !== "undefined" && value !== null);

const getUserOperationReceiptRequest = z.array(HexStringSchema);

type GetUserOperationReceiptRequestType = z.infer<
  typeof getUserOperationReceiptRequest
>;

export const getUserOperationReceipt = async (
  chainId: number,
  params: GetUserOperationReceiptRequestType,
  clientType?: ClientType,
) => {
  return ResultAsync.fromPromise(
    zodJsonRpcFetch(
      rpcClient(chainId, clientType),
      "eth_getUserOperationReceipt",
      params,
      getUserOperationReceiptResponse,
    ),
    (e) => e,
  );
};

// -----------------------------------------------------------------------------
// SendUserOperation
// -----------------------------------------------------------------------------

const sendUserOperationResponse = z.string();

const sendUserOperationV06Request = z.array(
  z
    .object({
      sender: HexStringSchema,
      nonce: HexStringSchema,
      initCode: HexStringSchema,
      callData: HexStringSchema,
      callGasLimit: HexStringSchema.optional(),
      verificationGasLimit: HexStringSchema.optional(),
      preVerificationGas: HexStringSchema.optional(),
      maxFeePerGas: HexStringSchema.optional(),
      maxPriorityFeePerGas: HexStringSchema.optional(),
      paymasterAndData: HexStringSchema,
      signature: HexStringSchema,
    })
    .or(z.string()),
);

type SendUserOperationV06RequestType = z.infer<
  typeof sendUserOperationV06Request
>;

export const sendUserOperationV06 = async (
  chainId: number,
  params: SendUserOperationV06RequestType,
  clientType?: ClientType,
) => {
  return ResultAsync.fromPromise(
    zodJsonRpcFetch(
      rpcClient(chainId, clientType),
      "eth_sendUserOperation",
      params,
      sendUserOperationResponse,
    ),
    (e) => e,
  );
};

const sendUserOperationV07Request = z.array(
  z
    .object({
      sender: HexStringSchema,
      nonce: HexStringSchema,
      factory: HexStringSchema.optional().nullable(),
      factoryData: HexStringSchema.optional().nullable(),
      callData: HexStringSchema,
      callGasLimit: HexStringSchema.optional(),
      verificationGasLimit: HexStringSchema.optional(),
      preVerificationGas: HexStringSchema.optional(),
      maxFeePerGas: HexStringSchema.optional(),
      maxPriorityFeePerGas: HexStringSchema.optional(),
      paymaster: HexStringSchema.optional().nullable(),
      paymasterVerificationGasLimit: HexStringSchema.optional().nullable(),
      paymasterPostOpGasLimit: HexStringSchema.optional().nullable(),
      paymasterData: HexStringSchema.optional().nullable(),
      signature: HexStringSchema,
    })
    .or(z.string()),
);

type SendUserOperationV07RequestType = z.infer<
  typeof sendUserOperationV07Request
>;

export const sendUserOperationV07 = async (
  chainId: number,
  params: SendUserOperationV07RequestType,
  clientType?: ClientType,
) => {
  return ResultAsync.fromPromise(
    zodJsonRpcFetch(
      rpcClient(chainId, clientType),
      "eth_sendUserOperation",
      params,
      sendUserOperationResponse,
    ),
    (e) => e,
  );
};

// -----------------------------------------------------------------------------
// EstimateUserOperationGas
// -----------------------------------------------------------------------------

const estimateUserOperationGasV06Response = z.object({
  callGasLimit: HexStringSchema,
  verificationGas: HexStringSchema.nullable().optional(),
  verificationGasLimit: HexStringSchema,
  preVerificationGas: HexStringSchema,
});

const estimateUserOperationGasV06Request = z.array(
  z
    .object({
      sender: HexStringSchema,
      nonce: HexStringSchema,
      initCode: HexStringSchema,
      callData: HexStringSchema,
      callGasLimit: HexStringSchema.optional(),
      verificationGasLimit: HexStringSchema.optional(),
      preVerificationGas: HexStringSchema.optional(),
      maxFeePerGas: HexStringSchema.optional(),
      maxPriorityFeePerGas: HexStringSchema.optional(),
      signature: HexStringSchema,
    })
    .or(z.string()),
);

type EstimateUserOperationGasV06RequestType = z.infer<
  typeof estimateUserOperationGasV06Request
>;

export const estimateUserOperationGasV06 = async (
  chainId: number,
  params: EstimateUserOperationGasV06RequestType,
  clientType?: ClientType,
) => {
  return ResultAsync.fromPromise(
    zodJsonRpcFetch(
      rpcClient(chainId, clientType),
      "eth_estimateUserOperationGas",
      params,
      estimateUserOperationGasV06Response,
    ),
    (e) => e,
  );
};

const estimateUserOperationGasV07Response = z.object({
  callGasLimit: HexStringSchema,
  verificationGasLimit: HexStringSchema,
  preVerificationGas: HexStringSchema,
  paymasterVerificationGasLimit: HexStringSchema.nullable().optional(),
  paymasterPostOpGasLimit: HexStringSchema.nullable().optional(),
});

const estimateUserOperationGasV07Request = z.array(
  z
    .object({
      sender: HexStringSchema,
      nonce: HexStringSchema,
      factory: HexStringSchema,
      factoryData: HexStringSchema,
      callData: HexStringSchema,
      callGasLimit: HexStringSchema.optional(),
      verificationGasLimit: HexStringSchema.optional(),
      preVerificationGas: HexStringSchema.optional(),
      maxFeePerGas: HexStringSchema.optional(),
      maxPriorityFeePerGas: HexStringSchema.optional(),
      paymaster: HexStringSchema.optional(),
      paymasterData: HexStringSchema.optional(),
      paymasterVerificationGasLimit: HexStringSchema.optional(),
      paymasterPostOpGasLimit: HexStringSchema.optional(),
      signature: HexStringSchema,
    })
    .or(z.string()),
);

type EstimateUserOperationGasV07RequestType = z.infer<
  typeof estimateUserOperationGasV07Request
>;

export const estimateUserOperationGasV07 = async (
  chainId: number,
  params: EstimateUserOperationGasV07RequestType,
  clientType?: ClientType,
) => {
  return ResultAsync.fromPromise(
    zodJsonRpcFetch(
      rpcClient(chainId, clientType),
      "eth_estimateUserOperationGas",
      params,
      estimateUserOperationGasV07Response,
    ),
    (e) => e,
  );
};

// -----------------------------------------------------------------------------
// Paymaster
// -----------------------------------------------------------------------------

const paymasterGasAndPaymasterAndDataV06Response = z.object({
  paymasterAndData: HexStringSchema,
  callGasLimit: HexStringSchema,
  verificationGasLimit: HexStringSchema,
  preVerificationGas: HexStringSchema,
});

const paymasterGasAndPaymasterAndDataV06Request = z.array(
  z.object({
    sender: HexStringSchema,
    nonce: HexStringSchema,
    initCode: HexStringSchema,
    callData: HexStringSchema,
    callGasLimit: HexStringSchema.optional(),
    verificationGasLimit: HexStringSchema.optional(),
    preVerificationGas: HexStringSchema.optional(),
    maxFeePerGas: HexStringSchema.optional(),
    maxPriorityFeePerGas: HexStringSchema.optional(),
    paymasterAndData: HexStringSchema,
    signature: HexStringSchema,
  }),
);

type PaymasterGasAndPaymasterAndDataV06RequestType = z.infer<
  typeof paymasterGasAndPaymasterAndDataV06Request
>;

export const getPaymasterGasAndPaymasterAndDataV06 = async (
  chainId: number,
  params: PaymasterGasAndPaymasterAndDataV06RequestType,
  clientType?: ClientType,
) => {
  return ResultAsync.fromPromise(
    zodJsonRpcFetch(
      rpcClient(chainId, clientType),
      "paymaster_requestGasAndPaymasterAndData",
      params,
      paymasterGasAndPaymasterAndDataV06Response,
    ),
    (e) => e,
  );
};

const paymasterGasAndPaymasterAndDataV07Response = z.object({
  callGasLimit: HexStringSchema,
  verificationGasLimit: HexStringSchema,
  preVerificationGas: HexStringSchema,
  paymaster: HexStringSchema,
  paymasterVerificationGasLimit: HexStringSchema,
  paymasterPostOpGasLimit: HexStringSchema,
  paymasterData: HexStringSchema,
});

const paymasterGasAndPaymasterAndDataV07Request = z.array(
  z.object({
    sender: HexStringSchema,
    nonce: HexStringSchema,
    factory: HexStringSchema.optional().nullable(),
    factoryData: HexStringSchema.optional().nullable(),
    callData: HexStringSchema,
    callGasLimit: HexStringSchema.optional(),
    verificationGasLimit: HexStringSchema.optional(),
    preVerificationGas: HexStringSchema.optional(),
    maxFeePerGas: HexStringSchema.optional(),
    maxPriorityFeePerGas: HexStringSchema.optional(),
    paymaster: HexStringSchema.optional().nullable(),
    paymasterVerificationGasLimit: HexStringSchema.optional().nullable(),
    paymasterPostOpGasLimit: HexStringSchema.optional().nullable(),
    paymasterData: HexStringSchema.optional().nullable(),
    signature: HexStringSchema,
  }),
);

type PaymasterGasAndPaymasterAndDataV07RequestType = z.infer<
  typeof paymasterGasAndPaymasterAndDataV07Request
>;

export const getPaymasterGasAndPaymasterAndDataV07 = async (
  chainId: number,
  params: PaymasterGasAndPaymasterAndDataV07RequestType,
  clientType?: ClientType,
) => {
  return ResultAsync.fromPromise(
    zodJsonRpcFetch(
      rpcClient(chainId, clientType),
      "paymaster_requestGasAndPaymasterAndData",
      params,
      paymasterGasAndPaymasterAndDataV07Response,
    ),
    (e) => e,
  );
};
