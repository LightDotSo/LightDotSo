// Copyright 2023-2024 Light.
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
    spamScore = 90,
  }: {
    address: string;
    limit: number | null;
    cursor: string | null;
    isTestnet: boolean | null;
    spamScore?: number | null;
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
      `${getSimplehashClient()}/v0/nfts/owners_v2?filters=spam_score__lte=${spamScore}&chains=${chains}&wallet_addresses=${address}&limit=${limit}${
        cursor ? `&cursor=${cursor}` : ""
      }`,
      nftsByOwnerSchema,
      "GET",
      headers,
    ),
    err => {
      console.error(err);
      return err as Error;
    },
  );
};
