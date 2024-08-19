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
  type GetTokensCountResponse,
  getTokensCount as getClientTokensCount,
} from "@lightdotso/client";
import type { TokenListCountParams } from "@lightdotso/params";
import { unstable_cache } from "next/cache";
import "server-only";

// -----------------------------------------------------------------------------
// Pre
// -----------------------------------------------------------------------------

export const preloadGetTokensCount = (params: TokenListCountParams) => {
  void getTokensCount(params);
};

// -----------------------------------------------------------------------------
// Service
// -----------------------------------------------------------------------------

export const getTokensCount = async (
  params: TokenListCountParams,
): GetTokensCountResponse => {
  return await getClientTokensCount(
    {
      params: {
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        query: { address: params.address!, is_testnet: params.is_testnet },
      },
    },
    "admin",
  );
};

// -----------------------------------------------------------------------------
// Cache
// -----------------------------------------------------------------------------

export const getCachedTokensCount = unstable_cache(getTokensCount);
