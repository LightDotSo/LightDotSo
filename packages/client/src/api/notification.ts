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
import { ResultAsync, errAsync, okAsync } from "neverthrow";
import type { ClientType } from "../client";
import { getClient } from "../client";
import type { paths } from "../types/api/v1";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type GetNotificationsParams =
  paths["/notification/list"]["get"]["parameters"];

export type GetNotificationsResponse = Promise<
  ResultAsync<
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
    params: GetNotificationsParams;
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
    return response.status === 200 && data ? okAsync(data) : errAsync(error);
  });
};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type GetNotificationsCountParams =
  paths["/notification/list"]["get"]["parameters"];

export type GetNotificationsCountResponse = Promise<
  ResultAsync<
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
    params: GetNotificationsCountParams;
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
    return response.status === 200 && data ? okAsync(data) : errAsync(error);
  });
};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export type PostNotificationParams = {};

export type PostNotificationBody =
  paths["/notification/read"]["post"]["requestBody"]["content"]["application/json"];

export type PostNotificationResponse = Promise<
  ResultAsync<
    number,
    | Error
    | { BadRequest: string }
    | { NotFound: string }
    | { InternalError: string }
    | { Unauthorized: string }
    | undefined
  >
>;

// -----------------------------------------------------------------------------
// POST
// -----------------------------------------------------------------------------

export const readNotification = async (
  {
    params,
    body,
  }: {
    params: PostNotificationParams;
    body: PostNotificationBody;
  },
  clientType?: ClientType,
): PostNotificationResponse => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.POST("/notification/read", {
      params: params,
      body: body,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? okAsync(data) : errAsync(error);
  });
};
