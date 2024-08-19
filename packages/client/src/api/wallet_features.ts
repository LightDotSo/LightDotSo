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

import type { WalletFeaturesData } from "@lightdotso/data";
import { type Result, ResultAsync, err, ok } from "neverthrow";
import type { ClientType } from "../client";
import { getClient } from "../client";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type GetWalletFeaturesResponse = Promise<
  Result<
    WalletFeaturesData,
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

export const getWalletFeatures = async (
  {
    params,
  }: {
    params: {
      query: { address: string };
    };
  },
  clientType?: ClientType,
): GetWalletFeaturesResponse => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.GET("/wallet/features/get", {
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

export type PutWalletFeaturesResponse = Promise<
  Result<
    WalletFeaturesData,
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

export const updateWalletFeatures = async (
  {
    params,
    body,
  }: {
    params: {
      query: { address: string };
    };
    body: {
      wallet_features: {
        is_enabled_ai?: boolean | null | undefined;
      };
    };
  },
  clientType?: ClientType,
): PutWalletFeaturesResponse => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.PUT("/wallet/features/update", {
      params: params,
      body: body,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};
