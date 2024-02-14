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

import { getEnsDomains } from "@lightdotso/client";
import type { EnsDataPage } from "@lightdotso/data";
import type { EnsListParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

export const useQueryEnsDomains = (params: EnsListParams) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

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

      const res = await getEnsDomains(
        "https://api.thegraph.com/subgraphs/name/ensdomains/ens",
        {
          name: params.name,
          amount: params.limit,
        },
      );

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
    ensDomains: ensPage?.domains
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
      })),

    isEnsDomainsLoading,
  };
};
