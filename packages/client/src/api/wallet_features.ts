// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { ResultAsync, err, ok } from "neverthrow";
import type { ClientType } from "../client";
import { getClient } from "../client";

// -----------------------------------------------------------------------------
// GET
// -----------------------------------------------------------------------------

export const getWalletFeatures = async (
  {
    params,
  }: {
    params: {
      query: { address: string };
    };
  },
  clientType?: ClientType,
) => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.GET("/wallet/features/get", {
      // @ts-ignore
      next: { revalidate: 300, tags: [params?.query?.address] },
      params,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};

// -----------------------------------------------------------------------------
// PUT
// -----------------------------------------------------------------------------

export const updateWalletFeatures = async (
  {
    params,
    body,
  }: {
    params: {
      query: { address: string };
    };
    body: {
      wallet_features: {
        is_enabled_ai?: boolean | null | undefined;
      };
    };
  },
  clientType?: ClientType,
) => {
  const client = getClient(clientType);

  return ResultAsync.fromPromise(
    client.PUT("/wallet/features/update", {
      // @ts-ignore
      next: { revalidate: 0 },
      params,
      body,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};
