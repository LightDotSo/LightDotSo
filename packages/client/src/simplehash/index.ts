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
  nftWalletValuationsSchema,
  simplehashChainSchema,
  simplehashMainnetChainSchema,
} from "@lightdotso/schemas";
import { ResultAsync } from "neverthrow";
import { zodFetch } from "../zod";

// -----------------------------------------------------------------------------
// Simplehash
// -----------------------------------------------------------------------------

export const getNftsByOwner = async ({
  address,
  limit = 10,
  cursor,
  isTestnet,
}: {
  address: string;
  limit?: number;
  cursor?: string;
  isTestnet?: boolean;
}) => {
  const chains = isTestnet
    ? simplehashChainSchema.options.join(",")
    : simplehashMainnetChainSchema.options.join(",");

  return ResultAsync.fromPromise(
    fetch(
      `https://api.simplehash.com/api/v0/nfts/owners?chains=${chains}&wallet_addresses=${address}&limit=${limit}${
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

export const getNftValuation = async (address: string) => {
  const chains = simplehashMainnetChainSchema.options.join(",");

  return ResultAsync.fromPromise(
    zodFetch(
      `https://api.simplehash.com/api/v0/nfts/owners/value?chains=${chains}&wallet_addresses=${address}`,
      nftWalletValuationsSchema,
      "GET",
      {
        revalidate: 300,
        tags: [address],
      },
      {
        "X-API-KEY": process.env.SIMPLEHASH_API_KEY!,
      },
    ),
    err => {
      if (err instanceof Error) {
        return err;
      }
    },
  );
};
