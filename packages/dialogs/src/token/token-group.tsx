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
import { useQueryTokenGroup } from "@lightdotso/query";
import { useAuth, useTokenGroups } from "@lightdotso/stores";
import { memo, useEffect } from "react";
import { Address } from "viem";

export type TokenGroupProps = {
  groupId?: string | undefined;
};

export type TokenGroupTokenProps = TokenGroupProps & {
  token: TokenData;
  wallet: Address;
};

export const BaseTokenGroup = ({ groupId }: TokenGroupProps) => {
  const { wallet } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { tokenGroup } = useQueryTokenGroup({
    id: groupId,
  });

  if (!wallet) {
    return;
  }

  return (
    <>
      {tokenGroup?.tokens &&
        tokenGroup?.tokens.map(token => {
          return (
            <TokenGroupToken
              key={token.id}
              token={token}
              groupId={groupId}
              wallet={wallet}
            />
          );
        })}
    </>
  );
};

export const BaseTokenGroupToken = ({
  token,
  wallet,
}: TokenGroupTokenProps) => {
  const { tokenAmount } = useTokenAmount({
    address: wallet,
    chainId: token.chain_id,
    tokenAddress: token.address as Address,
  });
  console.log(tokenAmount);

  const { setTokenGroupByGroupId } = useTokenGroups();

  useEffect(() => {
    if (tokenAmount && tokenAmount?.group && tokenAmount?.group?.id) {
      setTokenGroupByGroupId(tokenAmount.group.id, tokenAmount);
    }
  }, [tokenAmount?.group?.id, tokenAmount]);

  return null;
};

// -----------------------------------------------------------------------------
// Memo
// -----------------------------------------------------------------------------

export const TokenGroup = memo(BaseTokenGroup);
export const TokenGroupToken = memo(BaseTokenGroupToken);
