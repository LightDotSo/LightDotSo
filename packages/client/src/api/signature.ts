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

import { ResultAsync, errAsync, okAsync } from "neverthrow";
import type { ClientType } from "../client";
import { getClient } from "../client";
import type { paths } from "../types/api/v1";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type PostSignatureParams =
  paths["/signature/create"]["post"]["parameters"];

export type PostSignatureBody =
  paths["/signature/create"]["post"]["requestBody"]["content"]["application/json"];

export type PostSignatureResponse = Promise<
  ResultAsync<
    {
      created_at: string;
      owner_id: string;
      signature: string;
      signature_type: number;
    },
    | Error
    | { BadRequest: string }
    | { NotFound: string }
    | { RateLimitExceeded: string }
    | { ProviderError: string }
    | undefined
  >
>;

// -----------------------------------------------------------------------------
// POST
// -----------------------------------------------------------------------------

export const createSignature = async (
  {
    params,
    body,
  }: {
    params: PostSignatureParams;
    body: PostSignatureBody;
  },
  clientType?: ClientType,
): PostSignatureResponse => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.POST("/signature/create", {
      params: params,
      body: body,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? okAsync(data) : errAsync(error);
  });
};
