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
  nftsByOwnerSchema,
  simplehashChainSchema,
  simplehashMainnetChainSchema,
} from "@lightdotso/schemas";
import { ResultAsync } from "neverthrow";
import type { ClientType } from "../client";
import { getSimplehashClient } from "../client";
import { zodFetch } from "../zod";

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

  const headers: HeadersInit = {};

  if (clientType === "admin") {
    headers["X-API-KEY"] = process.env.SIMPLEHASH_API_KEY!;
  }

  return ResultAsync.fromPromise(
    zodFetch(
      `${getSimplehashClient(clientType)}/v0/nfts/owners?chains=${chains}&wallet_addresses=${address}&limit=${limit}${
        cursor ? `&cursor=${cursor}` : ""
      }`,
      nftsByOwnerSchema,
      "GET",
      {
        revalidate: 300,
        tags: [address],
      },
      headers,
    ),
    err => {
      console.error(err);
      return err as Error;
    },
  );
};
