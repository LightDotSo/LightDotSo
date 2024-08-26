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

import type { SocketBalancePageData } from "@lightdotso/data";
import { ResultAsync, err, ok } from "neverthrow";
import type { ClientType } from "../client";
import { getSocketClient } from "../client";
import type { paths } from "../types/socket/v2";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type GetSocketBalancesParams =
  paths["/v2/balances"]["get"]["parameters"];

export type GetSocketBalancesResponse = Promise<
  ResultAsync<
    SocketBalancePageData,
    Error | { BadRequest: string } | { NotFound: string } | undefined
  >
>;
// -----------------------------------------------------------------------------
// GET
// -----------------------------------------------------------------------------

export const getSocketBalances = async (
  {
    params,
  }: {
    params: GetSocketBalancesParams;
  },
  clientType?: ClientType,
) => {
  const client = getSocketClient(clientType);

  return ResultAsync.fromPromise(
    client.GET("/v2/balances", {
      params: params,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};
