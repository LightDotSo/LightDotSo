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
import { ResultAsync, errAsync, okAsync } from "neverthrow";
import type { ClientType } from "../client";
import { getClient } from "../client";
import type { paths } from "../types/api/v1";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type GetUserOperationParams =
  paths["/user_operation/get"]["get"]["parameters"];

export type GetUserOperationResponse = Promise<
  ResultAsync<
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
    params: GetUserOperationParams;
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
    return response.status === 200 && data ? okAsync(data) : errAsync(error);
  });
};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type GetUserOperationNonceParams =
  paths["/user_operation/nonce"]["get"]["parameters"];

export type GetUserOperationNonceResponse = Promise<
  ResultAsync<
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
    params: GetUserOperationNonceParams;
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
    return response.status === 200 && data ? okAsync(data) : errAsync(error);
  });
};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type GetUserOperationSignatureParams =
  paths["/user_operation/signature"]["get"]["parameters"];

export type GetUserOperationSignatureResponse = Promise<
  ResultAsync<
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
    params: GetUserOperationSignatureParams;
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
    return response.status === 200 && data ? okAsync(data) : errAsync(error);
  });
};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type GetUserOperationsParams =
  paths["/user_operation/list"]["get"]["parameters"];

export type GetUserOperationsResponse = Promise<
  ResultAsync<
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
    params: GetUserOperationsParams;
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
    return response.status === 200 && data ? okAsync(data) : errAsync(error);
  });
};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type GetUserOperationsCountParams =
  paths["/user_operation/list/count"]["get"]["parameters"];

export type GetUserOperationsCountResponse = Promise<
  ResultAsync<
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
    params: GetUserOperationsCountParams;
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
    return response.status === 200 && data ? okAsync(data) : errAsync(error);
  });
};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type PostUserOperationParams =
  paths["/user_operation/create"]["post"]["parameters"];

export type PostUserOperationBody =
  paths["/user_operation/create"]["post"]["requestBody"]["content"]["application/json"];

export type PostUserOperationResponse = Promise<
  ResultAsync<
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
    params: PostUserOperationParams;
    body: PostUserOperationBody;
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
    return response.status === 200 && data ? okAsync(data) : errAsync(error);
  });
};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type PostBatchUserOperationParams =
  paths["/user_operation/create/batch"]["post"]["parameters"];

export type PostBatchUserOperationBody =
  paths["/user_operation/create/batch"]["post"]["requestBody"]["content"]["application/json"];

export type PostBatchUserOperationResponse = Promise<
  ResultAsync<
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
    params: PostBatchUserOperationParams;
    body: PostBatchUserOperationBody;
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
    return response.status === 200 && data ? okAsync(data) : errAsync(error);
  });
};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type PutUserOperationParams =
  paths["/user_operation/update"]["put"]["parameters"];

export type PutUserOperationResponse = Promise<
  ResultAsync<
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
    params: PutUserOperationParams;
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
    return response.status === 200 && data ? okAsync(data) : errAsync(error);
  });
};
