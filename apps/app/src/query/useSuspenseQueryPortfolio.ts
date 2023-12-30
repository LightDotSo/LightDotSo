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

import { getPortfolio } from "@lightdotso/client";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import type { TokenPortfolioData } from "@/data";
import type { PortfolioParams } from "@/params";
import { queryKeys } from "@/queryKeys";
import { useAuth } from "@/stores";

export const useSuspenseQueryPortfolio = (params: PortfolioParams) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: TokenPortfolioData | undefined = queryClient.getQueryData(
    queryKeys.portfolio.get({ address: params.address }).queryKey,
  );

  const { data: portfolio } = useSuspenseQuery<TokenPortfolioData | null>({
    queryKey: queryKeys.portfolio.get({ address: params.address }).queryKey,
    queryFn: async () => {
      if (!params.address) {
        return null;
      }

      const res = await getPortfolio(
        {
          params: {
            query: {
              address: params.address,
            },
          },
        },
        clientType,
      );

      // Return if the response is 200
      return res.match(
        data => {
          return data;
        },
        _ => {
          return currentData ?? null;
        },
      );
    },
  });

  return {
    portfolio,
  };
};
