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

import type { ActivityCountData, ActivityData } from "@lightdotso/data";
import { ResultAsync, errAsync, okAsync } from "neverthrow";
import type { ClientType } from "../client";
import { getClient } from "../client";
import type { paths } from "../types/api/v1";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type GetActivitiesParams = paths["/activity/list"]["get"]["parameters"];

export type GetActivitiesResponse = Promise<
  ResultAsync<
    ActivityData[],
    Error | { BadRequest: string } | { NotFound: string } | undefined
  >
>;

// -----------------------------------------------------------------------------
// GET
// -----------------------------------------------------------------------------

export const getActivities = async (
  {
    params,
  }: {
    params: GetActivitiesParams;
  },
  clientType?: ClientType,
): GetActivitiesResponse => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.GET("/activity/list", {
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

export type GetActivitiesCountParams =
  paths["/activity/list/count"]["get"]["parameters"];

export type GetActivitiesCountResponse = Promise<
  ResultAsync<
    ActivityCountData,
    Error | { BadRequest: string } | { NotFound: string } | undefined
  >
>;

// -----------------------------------------------------------------------------
// GET
// -----------------------------------------------------------------------------

export const getActivitiesCount = async (
  {
    params,
  }: {
    params: GetActivitiesCountParams;
  },
  clientType?: ClientType,
): GetActivitiesCountResponse => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.GET("/activity/list/count", {
      params: params,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? okAsync(data) : errAsync(error);
  });
};
