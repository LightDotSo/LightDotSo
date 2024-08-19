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

import type {
  UserOperationCountData,
  UserOperationData,
  UserOperationNonceData,
  UserOperationSignatureData,
} from "@lightdotso/data";
import { type Result, ResultAsync, err, ok } from "neverthrow";
import type { ClientType } from "../client";
import { getClient } from "../client";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type GetUserOperationResponse = Promise<
  Result<
    UserOperationData,
    | Error
    | { BadRequest: string }
    | { NotFound: string }
    | { Unauthorized: string }
    | undefined
  >
>;

// -----------------------------------------------------------------------------
// GET
// -----------------------------------------------------------------------------

export const getUserOperation = async (
  {
    params,
  }: {
    params: {
      query: { user_operation_hash: string };
    };
  },
  clientType?: ClientType,
): GetUserOperationResponse => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.GET("/user_operation/get", {
      params: params,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type GetUserOperationNonceResponse = Promise<
  Result<
    UserOperationNonceData,
    | Error
    | { BadRequest: string }
    | { NotFound: string }
    | { Unauthorized: string }
    | undefined
  >
>;

// -----------------------------------------------------------------------------
// GET
// -----------------------------------------------------------------------------

export const getUserOperationNonce = async (
  {
    params,
  }: {
    params: {
      query: { address: string; chain_id: number };
    };
  },
  clientType?: ClientType,
): GetUserOperationNonceResponse => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.GET("/user_operation/nonce", {
      params: params,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type GetUserOperationSignatureResponse = Promise<
  Result<
    UserOperationSignatureData,
    | Error
    | { BadRequest: string }
    | { NotFound: string }
    | { Unauthorized: string }
    | undefined
  >
>;

// -----------------------------------------------------------------------------
// GET
// -----------------------------------------------------------------------------

export const getUserOperationSignature = async (
  {
    params,
  }: {
    params: {
      query: {
        user_operation_hash: string;
        configuration_id?: string | null | undefined;
      };
    };
  },
  clientType?: ClientType,
): GetUserOperationSignatureResponse => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.GET("/user_operation/signature", {
      params: params,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type GetUserOperationsResponse = Promise<
  Result<
    UserOperationData[],
    | Error
    | { BadRequest: string }
    | { NotFound: string }
    | { Unauthorized: string }
    | undefined
  >
>;

// -----------------------------------------------------------------------------
// GET
// -----------------------------------------------------------------------------

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
            order?: ("asc" | "desc") | null | undefined;
            status?:
              | (
                  | "queued"
                  | "pending"
                  | "executed"
                  | "reverted"
                  | "history"
                  | "invalid"
                )
              | null;
            is_testnet?: boolean | null | undefined;
            chain_id?: number | null | undefined;
          }
        | undefined;
    };
  },
  clientType?: ClientType,
): GetUserOperationsResponse => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.GET("/user_operation/list", {
      params: params,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type GetUserOperationsCountResponse = Promise<
  Result<
    UserOperationCountData,
    | Error
    | { BadRequest: string }
    | { NotFound: string }
    | { Unauthorized: string }
    | undefined
  >
>;

// -----------------------------------------------------------------------------
// GET
// -----------------------------------------------------------------------------

export const getUserOperationsCount = async (
  {
    params,
  }: {
    params: {
      query?:
        | {
            address?: string | null | undefined;
            status?:
              | (
                  | "queued"
                  | "pending"
                  | "executed"
                  | "reverted"
                  | "history"
                  | "invalid"
                )
              | null;
            is_testnet?: boolean | null | undefined;
          }
        | undefined;
    };
  },
  clientType?: ClientType,
): GetUserOperationsCountResponse => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.GET("/user_operation/list/count", {
      params: params,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type PostUserOperationResponse = Promise<
  Result<
    UserOperationData,
    | Error
    | { BadRequest: string }
    | { NotFound: string }
    | { Unauthorized: string }
    | undefined
  >
>;

// -----------------------------------------------------------------------------
// POST
// -----------------------------------------------------------------------------

export const createUserOperation = async (
  {
    params,
    body,
  }: {
    params: {
      query: {
        chain_id: number;
        is_direct_send?: boolean;
      };
    };
    body: {
      paymaster?: {
        address: string;
        sender: string;
        sender_nonce: number;
      };
      signature: {
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
      };
    };
  },
  clientType?: ClientType,
): PostUserOperationResponse => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.POST("/user_operation/create", {
      params: params,
      body: body,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type PostBatchUserOperationResponse = Promise<
  Result<
    UserOperationData[],
    | Error
    | { BadRequest: string }
    | { NotFound: string }
    | { Unauthorized: string }
    | undefined
  >
>;

// -----------------------------------------------------------------------------
// POST
// -----------------------------------------------------------------------------

export const createBatchUserOperation = async (
  {
    params,
    body,
  }: {
    params: {
      query: {
        chain_id: number;
        is_direct_send?: boolean;
      };
    };
    body: {
      paymaster?: {
        address: string;
        sender: string;
        sender_nonce: number;
      };
      merkle_root: string;
      signature: {
        owner_id: string;
        signature: string;
        signature_type: number;
      };
      user_operations: {
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
      }[];
    };
  },
  clientType?: ClientType,
): PostBatchUserOperationResponse => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.POST("/user_operation/create/batch", {
      params: params,
      body: body,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type PutUserOperationResponse = Promise<
  Result<
    { Updated: string },
    | Error
    | { BadRequest: string }
    | { NotFound: string }
    | { Unauthorized: string }
    | undefined
  >
>;

// -----------------------------------------------------------------------------
// PUT
// -----------------------------------------------------------------------------

export const updateUserOperation = async (
  {
    params,
  }: {
    params: {
      query: { address: string };
    };
  },
  clientType?: ClientType,
): PutUserOperationResponse => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.PUT("/user_operation/update", {
      params: params,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};
