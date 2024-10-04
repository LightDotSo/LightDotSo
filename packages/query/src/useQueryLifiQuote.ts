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

import { getLifiQuote } from "@lightdotso/client";
import type { LifiQuotePageData } from "@lightdotso/data";
import type { LifiQuoteParams } from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { isTestnet } from "@lightdotso/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

export const useQueryLifiQuote = (params: LifiQuoteParams) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: LifiQuotePageData | undefined = queryClient.getQueryData(
    queryKeys.lifi.quote({
      fromChain: params.fromChain,
      toChain: params.toChain,
      fromToken: params.fromToken,
      toToken: params.toToken,
      fromAddress: params.fromAddress,
      toAddress: params.toAddress,
      fromAmount: params.fromAmount,
    }).queryKey,
  );

  const {
    data: lifiQuote,
    isLoading: isLifiQuoteLoading,
    failureCount,
  } = useQuery<LifiQuotePageData | null>({
    queryKey: queryKeys.lifi.quote({
      fromChain: params.fromChain,
      toChain: params.toChain,
      fromToken: params.fromToken,
      toToken: params.toToken,
      fromAddress: params.fromAddress,
      toAddress: params.toAddress,
      fromAmount: params.fromAmount,
    }).queryKey,
    queryFn: async () => {
      if (
        !(
          params.fromAddress &&
          params.fromAmount &&
          params.fromChain &&
          params.fromToken &&
          params.toChain &&
          params.toToken
        ) ||
        params.fromChain === 0 ||
        params.toChain === 0 ||
        isTestnet(params.fromChain) ||
        isTestnet(params.toChain) ||
        (params.fromChain === params.toChain &&
          params.fromToken === params.toToken)
      ) {
        return null;
      }

      const res = await getLifiQuote(
        {
          params: {
            query: {
              fromChain: params.fromChain.toString(),
              toChain: params.toChain.toString(),
              fromToken: params.fromToken,
              toToken: params.toToken,
              fromAddress: params.fromAddress,
              toAddress: params.toAddress,
              fromAmount: params.fromAmount.toString(),
            },
          },
        },
        clientType,
      );

      return res.match(
        (data) => {
          return data as LifiQuotePageData;
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

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    lifiQuote: lifiQuote,
    isLifiQuoteLoading: isLifiQuoteLoading,
  };
};
