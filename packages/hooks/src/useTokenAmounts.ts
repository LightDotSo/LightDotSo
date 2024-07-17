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

import { TokenData } from "@lightdotso/data";
import { queryKeys } from "@lightdotso/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { TokenAmountProps } from "./useTokenAmount";
import { useEffect, useMemo, useState } from "react";

// -----------------------------------------------------------------------------
// Hook Props
// -----------------------------------------------------------------------------

type TokenAmountsProps = {
  tokenAmounts: TokenAmountProps[];
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useTokenAmounts = ({ tokenAmounts }: TokenAmountsProps) => {
  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [tokenDatas, setTokenDatas] = useState<TokenData[] | null>(null);

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const tokenGetQueryKeys = useMemo(() => {
    return tokenAmounts.map(tokenAmount => {
      return queryKeys.token.get({
        address: tokenAmount.tokenAddress,
        chain_id: tokenAmount.chainId,
        wallet: tokenAmount.address,
      }).queryKey;
    });
  }, [tokenAmounts]);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const getTokenQueriesData = useMemo(() => {
    if (!tokenAmounts || tokenAmounts.length === 0) {
      return null;
    }

    const queriesData = queryClient.getQueriesData<TokenData>({
      predicate: query => {
        if (query.queryKey.length === 3) {
          if (
            query.queryKey[0] === queryKeys.token._def[0] &&
            query.queryKey[1] === queryKeys.token.get._def[1]
          ) {
            // Iterate through tokenAmount query keys and check if the token query key matches
            for (let i = 0; i < tokenGetQueryKeys.length; i++) {
              if (
                (query.queryKey[2] as any).address ===
                  // @ts-ignore
                  tokenGetQueryKeys[i].address &&
                (query.queryKey[2] as any).chain_id ===
                  // @ts-ignore
                  tokenGetQueryKeys[i].chain_id &&
                (query.queryKey[2] as any).wallet ===
                  // @ts-ignore
                  tokenGetQueryKeys[i].wallet
              ) {
                console.log("Matched", query.queryHash);
                return true;
              }
            }
          }
        }

        return false;
      },
    });

    return queriesData
      .map(queryData => {
        return queryData[1];
      })
      .filter(tokenData => tokenData !== null && tokenData !== undefined);
  }, [tokenAmounts]);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (getTokenQueriesData) {
      setTokenDatas(getTokenQueriesData);
      console.log("TokenDatas", getTokenQueriesData);
    }
  }, [getTokenQueriesData]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    tokenAmounts: null,
  };
};
