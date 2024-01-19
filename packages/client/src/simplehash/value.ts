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
  simplehashMainnetChainSchema,
} from "@lightdotso/schemas";
import { ResultAsync } from "neverthrow";
import { ClientType, getSimplehashClient } from "../client";
import { zodFetch } from "../zod";

export const getNftValuation = async (
  address: string,
  clientType?: ClientType,
) => {
  const chains = simplehashMainnetChainSchema.options.join(",");

  return ResultAsync.fromPromise(
    zodFetch(
      `${getSimplehashClient(clientType)}/v0/nfts/owners/value?chains=${chains}&wallet_addresses=${address}`,
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
