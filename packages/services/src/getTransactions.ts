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
  type GetTransactionsResponse,
  getTransactions as getClientTransactions,
} from "@lightdotso/client";
import type { TransactionListParams } from "@lightdotso/params";
import { cache } from "react";
import "server-only";

// -----------------------------------------------------------------------------
// Pre
// -----------------------------------------------------------------------------

export const preloadGetTransactions = (params: TransactionListParams) => {
  void getTransactions(params);
};

// -----------------------------------------------------------------------------
// Service
// -----------------------------------------------------------------------------

export const getTransactions = async (
  params: TransactionListParams,
): GetTransactionsResponse => {
  return await getClientTransactions(
    {
      params: {
        query: {
          address: params.address,
          is_testnet: params.is_testnet,
          limit: params.limit,
          offset: params.offset,
        },
      },
    },
    "admin",
  );
};

// -----------------------------------------------------------------------------
// Cache
// -----------------------------------------------------------------------------

export const getCachedTransactions = cache(getTransactions);
