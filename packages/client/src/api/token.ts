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

import type { TokenCountData, TokenData } from "@lightdotso/data";
import { ResultAsync, err, ok } from "neverthrow";
import type { ClientType } from "../client";
import { getClient } from "../client";
import type { paths } from "../types/api/v1";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type GetTokenParams = paths["/token/get"]["get"]["parameters"];

export type GetTokenResponse = Promise<
  ResultAsync<
    TokenData,
    Error | { BadRequest: string } | { NotFound: string } | undefined
  >
>;

// -----------------------------------------------------------------------------
// GET
// -----------------------------------------------------------------------------

export const getToken = async (
  {
    params,
  }: {
    params: GetTokenParams;
  },
  clientType?: ClientType,
) => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.GET("/token/get", {
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

export type GetTokensParams = paths["/token/list"]["get"]["parameters"];

export type GetTokensResponse = Promise<
  ResultAsync<
    TokenData[],
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

export const getTokens = async (
  {
    params,
  }: {
    params: GetTokensParams;
  },
  clientType?: ClientType,
): GetTokensResponse => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.GET("/token/list", {
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

export type GetTokensCountParams =
  paths["/token/list/count"]["get"]["parameters"];

export type GetTokensCountResponse = Promise<
  ResultAsync<
    TokenCountData,
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

export const getTokensCount = async (
  {
    params,
  }: {
    params: GetTokensCountParams;
  },
  clientType?: ClientType,
): GetTokensCountResponse => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.GET("/token/list/count", {
      params: params,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};
