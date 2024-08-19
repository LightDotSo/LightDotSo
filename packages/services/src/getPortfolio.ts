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
  type GetPortfolioResponse,
  getPortfolio as getClientPortfolio,
} from "@lightdotso/client";
import type { PortfolioParams } from "@lightdotso/params";
import { unstable_cache } from "next/cache";
import "server-only";

// -----------------------------------------------------------------------------
// Pre
// -----------------------------------------------------------------------------

export const preloadGetPortfolio = (params: PortfolioParams) => {
  void getPortfolio(params);
};

// -----------------------------------------------------------------------------
// Service
// -----------------------------------------------------------------------------

export const getPortfolio = async (
  params: PortfolioParams,
): Promise<GetPortfolioResponse> => {
  return await getClientPortfolio(
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    { params: { query: { address: params.address! } } },
    "admin",
  );
};

// -----------------------------------------------------------------------------
// Cache
// -----------------------------------------------------------------------------

export const getCachedPortfolio = unstable_cache(getPortfolio);
