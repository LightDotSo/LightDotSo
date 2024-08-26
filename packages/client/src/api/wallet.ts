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

import type { WalletCountData, WalletData } from "@lightdotso/data";
import { ResultAsync, err, ok } from "neverthrow";
import type { ClientType } from "../client";
import { getClient } from "../client";
import type { paths } from "../types/api/v1";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type GetWalletParams = paths["/wallet/get"]["get"]["parameters"];

export type GetWalletResponse = Promise<
  ResultAsync<
    WalletData,
    | Error
    | { BadRequest: string }
    | { NotFound: string }
    | { Conflict: string }
    | { InvalidConfiguration: string }
    | undefined
  >
>;

// -----------------------------------------------------------------------------
// GET
// -----------------------------------------------------------------------------

export const getWallet = async (
  {
    params,
  }: {
    params: GetWalletParams;
  },
  clientType?: ClientType,
): GetWalletResponse => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.GET("/wallet/get", {
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

export type GetWalletsParams = paths["/wallet/list"]["get"]["parameters"];

export type GetWalletsResponse = Promise<
  ResultAsync<
    WalletData[],
    | Error
    | { BadRequest: string }
    | { NotFound: string }
    | { Conflict: string }
    | { InvalidConfiguration: string }
    | undefined
  >
>;

// -----------------------------------------------------------------------------
// GET
// -----------------------------------------------------------------------------

export const getWallets = async (
  {
    params,
  }: {
    params: GetWalletsParams;
  },
  clientType?: ClientType,
): GetWalletsResponse => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.GET("/wallet/list", {
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

export type GetWalletsCountParams =
  paths["/wallet/list/count"]["get"]["parameters"];

export type GetWalletsCountResponse = Promise<
  ResultAsync<
    WalletCountData,
    | Error
    | { BadRequest: string }
    | { NotFound: string }
    | { Conflict: string }
    | { InvalidConfiguration: string }
    | undefined
  >
>;

// -----------------------------------------------------------------------------
// GET
// -----------------------------------------------------------------------------

export const getWalletsCount = async (
  {
    params,
  }: {
    params: GetWalletsCountParams;
  },
  clientType?: ClientType,
) => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.GET("/wallet/list/count", {
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

export type PostWalletParams = paths["/wallet/create"]["post"]["parameters"];

export type PostWalletBody =
  paths["/wallet/create"]["post"]["requestBody"]["content"]["application/json"];

export type PostWalletResponse = Promise<
  ResultAsync<
    WalletData,
    | Error
    | { BadRequest: string }
    | { NotFound: string }
    | { Conflict: string }
    | { InvalidConfiguration: string }
    | undefined
  >
>;

// -----------------------------------------------------------------------------
// POST
// -----------------------------------------------------------------------------

export const createWallet = async (
  {
    params,
    body,
  }: {
    params: PostWalletParams;
    body: PostWalletBody;
  },
  clientType?: ClientType,
): PostWalletResponse => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.POST("/wallet/create", {
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

export type PutWalletParams = paths["/wallet/update"]["put"]["parameters"];

export type PutWalletBody =
  paths["/wallet/update"]["put"]["requestBody"]["content"]["application/json"];

export type PutWalletResponse = Promise<
  ResultAsync<
    WalletData,
    | Error
    | { BadRequest: string }
    | { NotFound: string }
    | { Conflict: string }
    | { InvalidConfiguration: string }
    | undefined
  >
>;

// -----------------------------------------------------------------------------
// PUT
// -----------------------------------------------------------------------------

export const updateWallet = async (
  {
    params,
    body,
  }: {
    params: PutWalletParams;
    body: PutWalletBody;
  },
  clientType?: ClientType,
): PutWalletResponse => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.PUT("/wallet/update", {
      params: params,
      body: body,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};
