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
import { type Result, ResultAsync, err, ok } from "neverthrow";
import type { ClientType } from "../client";
import { getClient } from "../client";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type GetWalletResponse = Promise<
  Result<
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
    params: {
      query: { address: string; chain_id?: number | null | undefined };
    };
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

export type GetWalletsResponse = Promise<
  Result<
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
    params: {
      query?:
        | {
            offset?: number | null | undefined;
            limit?: number | null | undefined;
            owner?: string | null | undefined;
            user_id?: string | null | undefined;
          }
        | undefined;
    };
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

export type GetWalletsCountResponse = Promise<
  Result<
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
    params: {
      query?:
        | {
            offset?: number | null | undefined;
            limit?: number | null | undefined;
            owner?: string | null | undefined;
            user_id?: string | null | undefined;
          }
        | undefined;
    };
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

export type PostWalletResponse = Promise<
  Result<
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
      invite_code: string;
    };
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

export type PutWalletResponse = Promise<
  Result<
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
    params: {
      query: { address: string };
    };
    body: {
      name: string;
    };
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
