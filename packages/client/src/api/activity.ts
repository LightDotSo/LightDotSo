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
import { type Result, ResultAsync, err, ok } from "neverthrow";
import type { ClientType } from "../client";
import { getClient } from "../client";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type GetActivitiesResponse = Promise<
  Result<
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
    params: {
      query?:
        | {
            offset?: number | null | undefined;
            limit?: number | null | undefined;
            address?: string | null | undefined;
            user_id?: string | null | undefined;
          }
        | undefined;
    };
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
    return response.status === 200 && data ? ok(data) : err(error);
  });
};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type GetActivitiesCountResponse = Promise<
  Result<
    ActivityCountData,
    Error | { BadRequest: string } | { NotFound: string } | undefined
  >
>;

export const getActivitiesCount = async (
  {
    params,
  }: {
    params: {
      query?:
        | {
            address?: string | null | undefined;
            user_id?: string | null | undefined;
          }
        | undefined;
    };
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
    return response.status === 200 && data ? ok(data) : err(error);
  });
};
