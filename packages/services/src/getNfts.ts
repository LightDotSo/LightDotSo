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

import {
  type GetNftsResponse,
  getNftsByOwner as getClientNftsByOwner,
} from "@lightdotso/client";
import type { NftListParams } from "@lightdotso/params";
import "server-only";

// -----------------------------------------------------------------------------
// Pre
// -----------------------------------------------------------------------------

export const preloadGetNfts = (params: NftListParams) => {
  void getNfts(params);
};

// -----------------------------------------------------------------------------
// Service
// -----------------------------------------------------------------------------

export const getNfts = async (
  params: NftListParams,
): Promise<GetNftsResponse> => {
  return await getClientNftsByOwner(
    {
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      address: params.address!,
      limit: params.limit,
      isTestnet: params.is_testnet,
      cursor: params.cursor,
    },
    "admin",
  );
};
