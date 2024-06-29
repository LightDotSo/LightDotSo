// Copyright 2023-2024 Light
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

import { getEnsDomains } from "@lightdotso/client";
import type { EnsDataPage } from "@lightdotso/data";
import type { EnsListParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

export const useQueryEnsDomains = (params: EnsListParams) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: EnsDataPage | undefined = queryClient.getQueryData(
    queryKeys.ens.list({
      name: params.name,
      limit: params.limit,
    }).queryKey,
  );

  const {
    data: ensPage,
    isLoading: isEnsDomainsLoading,
    failureCount,
  } = useQuery<EnsDataPage | null>({
    queryKey: queryKeys.ens.list({
      name: params.name,
      limit: params.limit,
    }).queryKey,
    queryFn: async () => {
      if (!params.name) {
        return null;
      }

      const res = await getEnsDomains({
        name: params.name,
        amount: params.limit,
      });

      return res.match(
        data => {
          return data as EnsDataPage;
        },
        err => {
          if (failureCount % 3 !== 2) {
            throw err;
          }
          return currentData ?? null;
        },
      );
    },
  });

  return {
    ensDomains:
      ensPage && ensPage?.domains && ensPage?.domains.length > 0
        ? ensPage?.domains
            .filter(
              domain =>
                domain.resolver &&
                domain.resolver.addr &&
                domain.resolver.addr.id !== null &&
                domain.name !== null,
            )
            .map(domain => ({
              name: domain.name,
              id: domain.resolver.addr.id,
            }))
        : [],
    isEnsDomainsLoading: isEnsDomainsLoading,
  };
};
