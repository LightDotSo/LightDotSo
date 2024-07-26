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

import { getLifiTokens } from "@lightdotso/client";
import type { LifiTokensPageData } from "@lightdotso/data";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

export const useQueryLifiTokens = () => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: LifiTokensPageData | undefined = queryClient.getQueryData(
    queryKeys.lifi.tokens().queryKey,
  );

  const {
    data: lifiTokensPage,
    isLoading: isLifiTokensLoading,
    failureCount,
  } = useQuery<LifiTokensPageData | null>({
    queryKey: queryKeys.lifi.tokens().queryKey,
    queryFn: async () => {
      const res = await getLifiTokens(
        {
          parameters: {},
        },
        clientType,
      );

      return res.match(
        (data) => {
          return data as LifiTokensPageData;
        },
        (err) => {
          if (failureCount % 3 !== 2) {
            throw err;
          }
          return currentData ?? null;
        },
      );
    },
  });

  return {
    lifiTokens: lifiTokensPage?.tokens
      ? Object.values(lifiTokensPage.tokens).flat()
      : [],
    isLifiTokensLoading: isLifiTokensLoading,
  };
};
