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

import { ResultAsync } from "neverthrow";
import { z } from "zod";
import { rpcClient } from "../client";
import { zodJsonRpcFetch } from "../zod";

// -----------------------------------------------------------------------------
// Rpc
// -----------------------------------------------------------------------------

const EthChainIdResultSchema = z
  .string()
  .refine(value => /^0x[0-9a-fA-F]+$/.test(value), {
    message: "ChainId must be a hexadecimal string",
  });

export const getChainId = async () => {
  return ResultAsync.fromPromise(
    zodJsonRpcFetch(
      "https://rpc.light.so/1",
      "eth_chainId",
      [],
      EthChainIdResultSchema,
      {
        revalidate: 0,
      },
    ),
    e => e,
  );
};

const HexStringSchema = z
  .string()
  .refine(value => /^0x[0-9a-fA-F]*$/.test(value), {
    message: "Must be a hexadecimal string",
  });

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
  isPublic?: boolean,
) => {
  return ResultAsync.fromPromise(
    zodJsonRpcFetch(
      rpcClient(chainId, isPublic),
      "eth_sendUserOperation",
      params,
      SendUserOperationResponse,
      {
        revalidate: 0,
      },
    ),
    e => e,
  );
};

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
  isPublic?: boolean,
) => {
  return ResultAsync.fromPromise(
    zodJsonRpcFetch(
      rpcClient(chainId, isPublic),
      "paymaster_requestGasAndPaymasterAndData",
      params,
      PaymasterGasAndPaymasterAndDataResponse,
      {
        revalidate: 0,
      },
    ),
    e => e,
  );
};
