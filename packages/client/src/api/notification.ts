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

import type { NotificationCountData, NotificationData } from "@lightdotso/data";
import { type Result, ResultAsync, err, ok } from "neverthrow";
import type { ClientType } from "../client";
import { getClient } from "../client";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type GetNotificationsResponse = Promise<
  Result<
    NotificationData[],
    Error | { BadRequest: string } | { NotFound: string } | undefined
  >
>;

// -----------------------------------------------------------------------------
// GET
// -----------------------------------------------------------------------------

export const getNotifications = async (
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
): GetNotificationsResponse => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.GET("/notification/list", {
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

export type GetNotificationsCountResponse = Promise<
  Result<
    NotificationCountData,
    Error | { BadRequest: string } | { NotFound: string } | undefined
  >
>;

// -----------------------------------------------------------------------------
// GET
// -----------------------------------------------------------------------------

export const getNotificationsCount = async (
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
) => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.GET("/notification/list/count", {
      params: params,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};

// -----------------------------------------------------------------------------
// POST
// -----------------------------------------------------------------------------

export const readNotification = async (
  {
    params,
    body,
  }: {
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    params: {};
    body: {
      notifications: {
        id: string;
      }[];
    };
  },
  clientType?: ClientType,
) => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.POST("/notification/read", {
      params: params,
      body: body,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};
