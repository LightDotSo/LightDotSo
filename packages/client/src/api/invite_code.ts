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

import type { InviteCodeCountData, InviteCodeData } from "@lightdotso/data";
import { ResultAsync, errAsync, okAsync } from "neverthrow";
import type { ClientType } from "../client";
import { getClient } from "../client";
import type { paths } from "../types/api/v1";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type GetInviteCodeParams =
  paths["/invite_code/get"]["get"]["parameters"];

export type GetInviteCodeResponse = Promise<
  ResultAsync<
    InviteCodeData,
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

export const getInviteCode = async (
  {
    params,
  }: {
    params: GetInviteCodeParams;
  },
  clientType?: ClientType,
): GetInviteCodeResponse => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.GET("/invite_code/get", {
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

export type GetInviteCodesParams =
  paths["/invite_code/list"]["get"]["parameters"];

export type GetInviteCodesResponse = Promise<
  ResultAsync<
    InviteCodeData[],
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

export const getInviteCodes = async (
  {
    params,
  }: {
    params: GetInviteCodesParams;
  },
  clientType?: ClientType,
): GetInviteCodesResponse => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.GET("/invite_code/list", {
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

export type GetInviteCodesCountParams =
  paths["/invite_code/list/count"]["get"]["parameters"];

export type GetInviteCodesCountResponse = Promise<
  ResultAsync<
    InviteCodeCountData,
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

export const getInviteCodesCount = async (
  {
    params,
  }: {
    params: GetInviteCodesCountParams;
  },
  clientType?: ClientType,
) => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.GET("/invite_code/list/count", {
      params: params,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? okAsync(data) : errAsync(error);
  });
};
