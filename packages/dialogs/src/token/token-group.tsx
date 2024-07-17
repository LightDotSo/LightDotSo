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
import { useTokenAmount } from "@lightdotso/hooks";
import { useTokenAmounts } from "@lightdotso/hooks/src/useTokenAmounts";
import { useQueryTokenGroup } from "@lightdotso/query";
import { useMemo } from "react";
import { Address } from "viem";

export type TokenGroupProps = {
  groupId: string;
  wallet: Address;
};

export type TokenGroupTokenProps = {
  token: TokenData;
  wallet: Address;
};

export const TokenGroup = ({ groupId, wallet }: TokenGroupProps) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { tokenGroup, isTokenGroupLoading } = useQueryTokenGroup({
    id: groupId,
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const tokenGroupTokens = useMemo(() => {
    return tokenGroup?.tokens;
  }, [tokenGroup]);

  const isTokenLoading = useMemo(() => {
    return isTokenGroupLoading;
  }, [isTokenGroupLoading]);

  useTokenAmounts({
    tokenAmounts:
      (tokenGroupTokens &&
        tokenGroupTokens?.map(token => {
          return {
            address: wallet,
            chainId: token.chain_id,
            tokenAddress: token.address as Address,
          };
        })) ??
      [],
  });

  return (
    <>
      {tokenGroupTokens &&
        tokenGroupTokens.map(token => {
          return (
            <TokenGroupToken key={token.id} token={token} wallet={wallet} />
          );
        })}
    </>
  );
};

export const TokenGroupToken = ({ token, wallet }: TokenGroupTokenProps) => {
  useTokenAmount({
    address: wallet,
    chainId: token.chain_id,
    tokenAddress: token.address as Address,
  });

  return null;
};
