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

import type { WalletSettingsData } from "@lightdotso/data";
import { ResultAsync, errAsync, okAsync } from "neverthrow";
import type { ClientType } from "../client";
import { getClient } from "../client";
import type { paths } from "../types/api/v1";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type GetWalletSettingsParams =
  paths["/wallet/settings/get"]["get"]["parameters"];

export type GetWalletSettingsResponse = Promise<
  ResultAsync<
    WalletSettingsData,
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

export const getWalletSettings = async (
  {
    params,
  }: {
    params: GetWalletSettingsParams;
  },
  clientType?: ClientType,
): GetWalletSettingsResponse => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.GET("/wallet/settings/get", {
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

export type PutWalletSettingsParams =
  paths["/wallet/settings/update"]["put"]["parameters"];

export type PutWalletSettingsBody =
  paths["/wallet/settings/update"]["put"]["requestBody"]["content"]["application/json"];

export type PutWalletSettingsResponse = Promise<
  ResultAsync<
    WalletSettingsData,
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

export const updateWalletSettings = async (
  {
    params,
    body,
  }: {
    params: PutWalletSettingsParams;
    body: PutWalletSettingsBody;
  },
  clientType?: ClientType,
): PutWalletSettingsResponse => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.PUT("/wallet/settings/update", {
      params: params,
      body: body,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? okAsync(data) : errAsync(error);
  });
};
