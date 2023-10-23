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

import createClient from "openapi-fetch";
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
import type { paths, Without, XOR, OneOf } from "./v1";
import { ResultAsync } from "neverthrow";
import { zodFetch, zodJsonRpcFetch } from "./zod";
import { llamaSchema } from "@lightdotso/schemas";
import { z } from "zod";

const devApiClient = createClient<paths>({
  baseUrl: "http://localhost:3000/admin/v1",
  headers: {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_LIGHT_ADMIN_TOKEN}`,
  },
});

const publicApiClient = createClient<paths>({
  baseUrl: "https://api.light.so/v1",
});

const adminApiClient = createClient<paths>({
  baseUrl: "https://api.light.so/admin/v1",
  headers: {
    Authorization: `Bearer ${process.env.LIGHT_ADMIN_TOKEN}`,
  },
});

const rpcClient = (chainId: number, isPublic?: boolean) => {
  if (isPublic === undefined || isPublic) {
    return `https://rpc.light.so/${chainId}`;
  }

  return `https://rpc.light.so/protected/${process.env.LIGHT_RPC_TOKEN}/${chainId}`;
};

const getClient = (isPublic?: boolean) =>
  process.env.LOCAL_ENV === "dev" || process.env.NEXT_PUBLIC_LOCAL_ENV === "dev"
    ? devApiClient
    : isPublic === undefined || isPublic
    ? publicApiClient
    : adminApiClient;

export const getConfiguration = async (
  {
    params,
  }: {
    params: {
      query: { address: string };
    };
  },
  isPublic?: boolean,
) => {
  const client = getClient(isPublic);

  return ResultAsync.fromPromise(
    client.GET("/configuration/get", {
      params,
    }),
    () => new Error("Database error"),
  );
};

export const getWallet = async (
  {
    params,
  }: {
    params: {
      query: { address: string; chain_id?: number | null | undefined };
    };
  },
  isPublic?: boolean,
) => {
  const client = getClient(isPublic);

  return ResultAsync.fromPromise(
    client.GET("/wallet/get", {
      params,
    }),
    () => new Error("Database error"),
  );
};

export const getWallets = async (
  {
    params,
  }: {
    params: {
      query?:
        | {
            offset?: number | null | undefined;
            limit?: number | null | undefined;
            owner?: string | null | undefined;
          }
        | undefined;
    };
  },
  isPublic?: boolean,
) => {
  const client = getClient(isPublic);

  return ResultAsync.fromPromise(
    client.GET("/wallet/list", {
      params,
    }),
    () => new Error("Database error"),
  );
};

export const createWallet = async ({
  params,
  body,
}: {
  params: {
    query?: { simulate?: boolean | null | undefined } | undefined;
  };
  body: {
    name: string;
    owners: {
      address: string;
      weight: number;
    }[];
    salt: string;
    threshold: number;
  };
}) => {
  const client = getClient(true);

  return ResultAsync.fromPromise(
    client.POST("/wallet/create", {
      params,
      body,
    }),
    () => new Error("Database error"),
  );
};

export const createUserOperation = async ({
  params,
  body,
}: {
  params: {
    query: {
      chain_id: number;
    };
  };
  body: {
    signature: {
      id: string;
      owner_id: string;
      signature: string;
      signature_type: number;
    };
    user_operation: {
      chain_id: number;
      call_data: string;
      call_gas_limit: number;
      hash: string;
      init_code: string;
      max_fee_per_gas: number;
      max_priority_fee_per_gas: number;
      nonce: number;
      paymaster_and_data: string;
      pre_verification_gas: number;
      sender: string;
      verification_gas_limit: number;
      signatures: {
        owner_id: string;
        signature: string;
        signature_type: number;
      }[];
    };
  };
}) => {
  const client = getClient(true);

  return ResultAsync.fromPromise(
    client.POST("/user_operation/create", {
      params,
      body,
    }),
    () => new Error("Database error"),
  );
};

export const getUserOperation = async (
  {
    params,
  }: {
    params: {
      query: { user_operation_hash: string };
    };
  },
  isPublic?: boolean,
) => {
  const client = getClient(isPublic);

  return ResultAsync.fromPromise(
    client.GET("/user_operation/get", {
      params,
    }),
    () => new Error("Database error"),
  );
};

export const getSignatureUserOperation = async (
  {
    params,
  }: {
    params: {
      query: { user_operation_hash: string };
    };
  },
  isPublic?: boolean,
) => {
  const client = getClient(isPublic);

  return ResultAsync.fromPromise(
    client.GET("/user_operation/signature", {
      params,
    }),
    () => new Error("Database error"),
  );
};

export const getUserOperations = async (
  {
    params,
  }: {
    params: {
      query?:
        | {
            offset?: number | null | undefined;
            limit?: number | null | undefined;
            address?: string | null | undefined;
          }
        | undefined;
    };
  },
  isPublic?: boolean,
) => {
  const client = getClient(isPublic);

  return ResultAsync.fromPromise(
    client.GET("/user_operation/list", {
      params,
    }),
    () => new Error("Database error"),
  );
};

export const getLlama = async (address: string) => {
  return zodFetch(
    `https://api.llamafolio.com/balances/${address}`,
    llamaSchema,
  );
};

const EthChainIdResultSchema = z
  .string()
  .refine(value => /^0x[0-9a-fA-F]+$/.test(value), {
    message: "ChainId must be a hexadecimal string",
  });

export const getChainId = async () => {
  return zodJsonRpcFetch(
    "https://rpc.light.so/1",
    "eth_chainId",
    [],
    EthChainIdResultSchema,
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
  return zodJsonRpcFetch(
    rpcClient(chainId, isPublic),
    "eth_sendUserOperation",
    params,
    SendUserOperationResponse,
  );
};

const PaymasterGasAndPaymasterAndDataResponse = z.object({
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
  return zodJsonRpcFetch(
    rpcClient(chainId, isPublic),
    "paymaster_requestGasAndPaymasterAndData",
    params,
    PaymasterGasAndPaymasterAndDataResponse,
  );
};
