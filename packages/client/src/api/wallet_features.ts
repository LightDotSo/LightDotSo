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
import { ResultAsync, errAsync, okAsync } from "neverthrow";
import type { ClientType } from "../client";
import { getClient } from "../client";
import type { paths } from "../types/api/v1";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type GetWalletFeaturesParams =
  paths["/wallet/features/get"]["get"]["parameters"];

export type GetWalletFeaturesResponse = Promise<
  ResultAsync<
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
    params: GetWalletFeaturesParams;
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
    return response.status === 200 && data ? okAsync(data) : errAsync(error);
  });
};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type PutWalletFeaturesParams =
  paths["/wallet/features/update"]["put"]["parameters"];

export type PutWalletFeaturesBody =
  paths["/wallet/features/update"]["put"]["requestBody"]["content"]["application/json"];

export type PutWalletFeaturesResponse = Promise<
  ResultAsync<
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
    params: PutWalletFeaturesParams;
    body: PutWalletFeaturesBody;
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
    return response.status === 200 && data ? okAsync(data) : errAsync(error);
  });
};
