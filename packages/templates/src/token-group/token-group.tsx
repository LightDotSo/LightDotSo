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

"use client";

import type { TokenData } from "@lightdotso/data";
import { useTokenAmount } from "@lightdotso/hooks";
import { useQueryTokenGroup } from "@lightdotso/query";
import { useAuth, useTokenGroups } from "@lightdotso/stores";
import { memo, useEffect } from "react";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type TokenGroupProps = {
  groupId?: string | undefined;
};

export type TokenGroupTokenProps = TokenGroupProps & {
  token: TokenData;
  wallet: Address;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const BaseTokenGroup = ({ groupId }: TokenGroupProps) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { wallet } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { tokenGroup } = useQueryTokenGroup({
    id: groupId,
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!wallet) {
    return;
  }

  return (
    <>
      {tokenGroup?.tokens?.map((token) => {
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

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const BaseTokenGroupToken = ({
  token,
  wallet,
  groupId,
}: TokenGroupTokenProps) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { tokenAmount } = useTokenAmount({
    address: wallet,
    chainId: token.chain_id,
    tokenAddress: token.address as Address,
  });

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { setTokenGroupByGroupId } = useTokenGroups();

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (groupId && tokenAmount) {
      setTokenGroupByGroupId(groupId, tokenAmount);
    }
  }, [groupId, tokenAmount]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return null;
};

// -----------------------------------------------------------------------------
// Memo
// -----------------------------------------------------------------------------

export const TokenGroup = memo(BaseTokenGroup);
export const TokenGroupToken = memo(BaseTokenGroupToken);
