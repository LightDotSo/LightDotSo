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

import type { FeedbackData } from "@lightdotso/data";
import { ResultAsync, err, ok } from "neverthrow";
import type { ClientType } from "../client";
import { getClient } from "../client";
import type { paths } from "../types/api/v1";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type PostFeedbackBody =
  paths["/feedback/create"]["post"]["requestBody"]["content"]["application/json"];

export type PostFeedbackResponse = Promise<
  ResultAsync<
    FeedbackData,
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

export const createFeedback = async (
  {
    body,
  }: {
    body: PostFeedbackBody;
  },
  clientType?: ClientType,
): PostFeedbackResponse => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.POST("/feedback/create", {
      body: body,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};
