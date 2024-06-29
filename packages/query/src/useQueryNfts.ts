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

import { getNftsByOwner } from "@lightdotso/client";
import type { NftDataPage } from "@lightdotso/data";
import type { NftListParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

export const useQueryNfts = (params: NftListParams) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: NftDataPage | undefined = queryClient.getQueryData(
    queryKeys.nft.list({
      address: params.address,
      is_testnet: params.is_testnet,
      limit: params.limit,
      cursor: params.cursor,
    }).queryKey,
  );

  const {
    data: nftPage,
    isLoading: isNftsLoading,
    failureCount,
  } = useQuery<NftDataPage | null>({
    queryKey: queryKeys.nft.list({
      address: params.address,
      is_testnet: params.is_testnet,
      limit: params.limit,
      cursor: params.cursor,
    }).queryKey,
    queryFn: async () => {
      if (!params.address) {
        return null;
      }

      const res = await getNftsByOwner(
        {
          address: params.address,
          limit: params.limit,
          isTestnet: params.is_testnet,
          cursor: params.cursor,
        },
        clientType,
      );

      return res.match(
        data => {
          return data as NftDataPage;
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
    nftPage: nftPage,
    isNftsLoading: isNftsLoading,
  };
};
