// Copyright 2023-2024 Light
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
  .refine(value => /^0x[0-9a-fA-F]+$/.test(value), {
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
    e => e,
  );
};

const HexStringSchema = z
  .string()
  .refine(value => /^0x[0-9a-fA-F]*$/.test(value), {
    message: "Must be a hexadecimal string",
  });

// -----------------------------------------------------------------------------
// GetUserOperation
// -----------------------------------------------------------------------------

const GetUserOperationReceiptResponse = z
  .any()
  .refine(value => typeof value !== "undefined" && !!value);

const GetUserOperationReceiptRequest = z.array(HexStringSchema);

type GetUserOperationReceiptRequestType = z.infer<
  typeof GetUserOperationReceiptRequest
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
      GetUserOperationReceiptResponse,
    ),
    e => e,
  );
};

// -----------------------------------------------------------------------------
// SendUserOperation
// -----------------------------------------------------------------------------

const SendUserOperationResponse = z.string();

const SendUserOperationRequest = z.array(
  z
    .object({
      sender: HexStringSchema,
      nonce: HexStringSchema,
      initCode: HexStringSchema,
      callData: HexStringSchema,
      signature: HexStringSchema,
      paymasterAndData: HexStringSchema,
      callGasLimit: HexStringSchema.optional(),
      verificationGasLimit: HexStringSchema.optional(),
      preVerificationGas: HexStringSchema.optional(),
      maxFeePerGas: HexStringSchema.optional(),
      maxPriorityFeePerGas: HexStringSchema.optional(),
    })
    .or(z.string()),
);

type SendUserOperationRequestType = z.infer<typeof SendUserOperationRequest>;

export const sendUserOperation = async (
  chainId: number,
  params: SendUserOperationRequestType,
  clientType?: ClientType,
) => {
  return ResultAsync.fromPromise(
    zodJsonRpcFetch(
      rpcClient(chainId, clientType),
      "eth_sendUserOperation",
      params,
      SendUserOperationResponse,
    ),
    e => e,
  );
};

// -----------------------------------------------------------------------------
// EstimateUserOperationGas
// -----------------------------------------------------------------------------

const EstimateUserOperationGasResponse = z.object({
  callGasLimit: HexStringSchema,
  verificationGas: HexStringSchema.nullable().optional(),
  verificationGasLimit: HexStringSchema,
  preVerificationGas: HexStringSchema,
});

const EstimateUserOperationGasRequest = z.array(
  z
    .object({
      sender: HexStringSchema,
      nonce: HexStringSchema,
      initCode: HexStringSchema,
      callData: HexStringSchema,
      signature: HexStringSchema,
      paymasterAndData: HexStringSchema,
      callGasLimit: HexStringSchema.optional(),
      verificationGasLimit: HexStringSchema.optional(),
      preVerificationGas: HexStringSchema.optional(),
      maxFeePerGas: HexStringSchema.optional(),
      maxPriorityFeePerGas: HexStringSchema.optional(),
    })
    .or(z.string()),
);

type EstimateUserOperationGasRequestType = z.infer<
  typeof EstimateUserOperationGasRequest
>;

export const estimateUserOperationGas = async (
  chainId: number,
  params: EstimateUserOperationGasRequestType,
  clientType?: ClientType,
) => {
  return ResultAsync.fromPromise(
    zodJsonRpcFetch(
      rpcClient(chainId, clientType),
      "eth_estimateUserOperationGas",
      params,
      EstimateUserOperationGasResponse,
    ),
    e => e,
  );
};

// -----------------------------------------------------------------------------
// Paymaster
// -----------------------------------------------------------------------------

const PaymasterGasAndPaymasterAndDataResponse = z.object({
  paymasterNonce: HexStringSchema,
  paymasterAndData: HexStringSchema,
  callGasLimit: HexStringSchema,
  verificationGasLimit: HexStringSchema,
  preVerificationGas: HexStringSchema,
  maxFeePerGas: HexStringSchema,
  maxPriorityFeePerGas: HexStringSchema,
});

const PaymasterGasAndPaymasterAndDataRequest = z.array(
  z.object({
    sender: HexStringSchema,
    nonce: HexStringSchema,
    initCode: HexStringSchema,
    callData: HexStringSchema,
    signature: HexStringSchema,
    paymasterAndData: HexStringSchema,
    callGasLimit: HexStringSchema.optional(),
    verificationGasLimit: HexStringSchema.optional(),
    preVerificationGas: HexStringSchema.optional(),
    maxFeePerGas: HexStringSchema.optional(),
    maxPriorityFeePerGas: HexStringSchema.optional(),
  }),
);

type PaymasterGasAndPaymasterAndDataRequestType = z.infer<
  typeof PaymasterGasAndPaymasterAndDataRequest
>;

export const getPaymasterGasAndPaymasterAndData = async (
  chainId: number,
  params: PaymasterGasAndPaymasterAndDataRequestType,
  clientType?: ClientType,
) => {
  return ResultAsync.fromPromise(
    zodJsonRpcFetch(
      rpcClient(chainId, clientType),
      "paymaster_requestGasAndPaymasterAndData",
      params,
      PaymasterGasAndPaymasterAndDataResponse,
    ),
    e => e,
  );
};
