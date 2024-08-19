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
  type GetUserOperationMerkleResponse,
  getUserOperationMerkle as getClientUserOperationMerkle,
} from "@lightdotso/client";
import type { UserOperationMerkleGetParams } from "@lightdotso/params";
import { unstable_cache } from "next/cache";
import "server-only";

// -----------------------------------------------------------------------------
// Pre
// -----------------------------------------------------------------------------

export const preloadGetUserOperationMerkle = (
  params: UserOperationMerkleGetParams,
) => {
  void getUserOperationMerkle(params);
};

// -----------------------------------------------------------------------------
// Service
// -----------------------------------------------------------------------------

export const getUserOperationMerkle = async (
  params: UserOperationMerkleGetParams,
): GetUserOperationMerkleResponse => {
  return await getClientUserOperationMerkle(
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    { params: { query: { root: params.root! } } },
    "admin",
  );
};

// -----------------------------------------------------------------------------
// Cache
// -----------------------------------------------------------------------------

export const getCachedUserOperationMerkle = unstable_cache(
  getUserOperationMerkle,
);
