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

import {
  simplehashChainSchema,
  simplehashMainnetChainSchema,
} from "@lightdotso/schemas";
import { ResultAsync } from "neverthrow";
import type { ClientType } from "../client";
import { getSimplehashClient } from "../client";

export const getNftsByOwner = async (
  {
    address,
    limit = 10,
    cursor,
    isTestnet,
  }: {
    address: string;
    limit: number | null;
    cursor: string | null;
    isTestnet: boolean | null;
  },
  clientType?: ClientType,
) => {
  const chains = isTestnet
    ? simplehashChainSchema.options.join(",")
    : simplehashMainnetChainSchema.options.join(",");

  return ResultAsync.fromPromise(
    fetch(
      `${getSimplehashClient(clientType)}/v0/nfts/owners?chains=${chains}&wallet_addresses=${address}&limit=${limit}${
        cursor ? `&cursor=${cursor}` : ""
      }`,
      {
        method: "GET",
        headers: {
          "content-type": "application/json",
          "X-API-KEY": process.env.SIMPLEHASH_API_KEY!,
        },
      },
    ),
    err => err as Error,
  ).andThen(response => {
    return ResultAsync.fromPromise(response.json(), err => err as Error);
  });
};
