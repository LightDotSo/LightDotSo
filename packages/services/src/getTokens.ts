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

import { getTokens as getClientTokens } from "@lightdotso/client";
import type { TokenListParams } from "@lightdotso/params";
import "server-only";

// -----------------------------------------------------------------------------
// Pre
// -----------------------------------------------------------------------------

export const preloadGetTokens = (params: TokenListParams) => {
  void getTokens(params);
};

// -----------------------------------------------------------------------------
// Service
// -----------------------------------------------------------------------------

export const getTokens = async (params: TokenListParams) => {
  return await getClientTokens(
    {
      params: {
        query: {
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          address: params.address!,
          is_testnet: params.is_testnet,
          group: params.group,
          limit: params.limit,
          offset: params.offset,
          chain_ids: params.chain_ids?.join(","),
        },
      },
    },
    "admin",
  );
};
