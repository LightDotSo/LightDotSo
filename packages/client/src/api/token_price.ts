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

import type { TokenPriceData } from "@lightdotso/data";
import { ResultAsync, errAsync, okAsync } from "neverthrow";
import type { ClientType } from "../client";
import { getClient } from "../client";
import type { paths } from "../types/api/v1";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type GetTokenPriceParams =
  paths["/token_price/get"]["get"]["parameters"];

export type GetTokenPriceResponse = Promise<
  ResultAsync<
    TokenPriceData,
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

export const getTokenPrice = async (
  {
    params,
  }: {
    params: GetTokenPriceParams;
  },
  clientType?: ClientType,
): GetTokenPriceResponse => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.GET("/token_price/get", {
      params: params,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? okAsync(data) : errAsync(error);
  });
};
