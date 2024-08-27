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

import { ResultAsync, errAsync, okAsync } from "neverthrow";
import type { ClientType } from "../client";
import { getClient } from "../client";
import type { paths } from "../types/api/v1";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type PostQueueResponse = Promise<
  ResultAsync<
    { Queued: string },
    | Error
    | { BadRequest: string }
    | { NotFound: string }
    | { RateLimitExceeded: string }
    | { ProviderError: string }
    | undefined
  >
>;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type PostQueuePortfolioParams =
  paths["/queue/portfolio"]["post"]["parameters"];

// -----------------------------------------------------------------------------
// POST
// -----------------------------------------------------------------------------

export const createQueuePortfolio = async (
  {
    params,
  }: {
    params: PostQueuePortfolioParams;
  },
  clientType?: ClientType,
): PostQueueResponse => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.POST("/queue/portfolio", {
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

export type PostQueueTokenParams = paths["/queue/token"]["post"]["parameters"];

// -----------------------------------------------------------------------------
// POST
// -----------------------------------------------------------------------------

export const createQueueToken = async (
  {
    params,
  }: {
    params: PostQueueTokenParams;
  },
  clientType?: ClientType,
): PostQueueResponse => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.POST("/queue/token", {
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

export type PostQueueInterpretationParams =
  paths["/queue/interpretation"]["post"]["parameters"];

// -----------------------------------------------------------------------------
// POST
// -----------------------------------------------------------------------------

export const createQueueInterpretation = async (
  {
    params,
  }: {
    params: PostQueueInterpretationParams;
  },
  clientType?: ClientType,
): PostQueueResponse => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.POST("/queue/interpretation", {
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

export type PostQueueTransactionParams =
  paths["/queue/transaction"]["post"]["parameters"];

// -----------------------------------------------------------------------------
// POST
// -----------------------------------------------------------------------------

export const createQueueTransaction = async (
  {
    params,
  }: {
    params: PostQueueTransactionParams;
  },
  clientType?: ClientType,
): PostQueueResponse => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.POST("/queue/transaction", {
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

export type PostQueueUserOperationParams =
  paths["/queue/user_operation"]["post"]["parameters"];

// -----------------------------------------------------------------------------
// POST
// -----------------------------------------------------------------------------

export const createQueueUserOperation = async (
  {
    params,
  }: {
    params: PostQueueUserOperationParams;
  },
  clientType?: ClientType,
): PostQueueResponse => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.POST("/queue/user_operation", {
      params: params,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? okAsync(data) : errAsync(error);
  });
};
