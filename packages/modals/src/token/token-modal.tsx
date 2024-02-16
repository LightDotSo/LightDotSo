// Copyright 2023-2024 Light, Inc.
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

import { CHAINS, MAINNET_CHAINS } from "@lightdotso/const";
import type { TokenData } from "@lightdotso/data";
import { EmptyState, TokenImage } from "@lightdotso/elements";
import { useQuerySocketBalances, useQueryTokens } from "@lightdotso/query";
import { useModals } from "@lightdotso/stores";
import { ChainLogo } from "@lightdotso/svg";
import { Modal } from "@lightdotso/templates";
import { Button, ButtonIcon } from "@lightdotso/ui";
import { cn, refineNumberFormat } from "@lightdotso/utils";
import { type FC, useMemo, useState } from "react";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TokenModal: FC = () => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const {
    tokenModalProps: { address, isTestnet, onClose, onTokenSelect, type },
    isTokenModalVisible,
  } = useModals();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { tokens } = useQueryTokens({
    address: address,
    is_testnet: isTestnet ?? false,
    limit: Number.MAX_SAFE_INTEGER,
    offset: 0,
    group: false,
    chain_ids: null,
  });

  const { balances } = useQuerySocketBalances({
    address: address,
  });

  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [chainId, setChainId] = useState<number>(0);

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const chains = useMemo(() => {
    if (isTestnet) {
      return CHAINS;
    }

    return MAINNET_CHAINS;
  }, [isTestnet]);

  const renderedTokens: TokenData[] = useMemo(() => {
    if (type === "native") {
      const filtered_tokens =
        tokens && chainId > 0
          ? tokens.filter(token => token.chain_id === chainId)
          : tokens;

      return filtered_tokens || [];
    }

    const filtered_balances =
      (balances && chainId > 0
        ? balances.filter(balance => balance.chainId === chainId)
        : balances) || [];

    // Map the balances to tokens
    return filtered_balances.map(balance => ({
      id: `${balance.chainId}-${balance.address}-${balance.decimals}`,
      chain_id: balance.chainId,
      balance_usd: 0,
      address: balance.address,
      amount: balance.amount,
      chainId: balance.chainId,
      decimals: balance.decimals,
      name: balance.name,
      symbol: balance.symbol,
    }));
  }, [balances, chainId, tokens, type]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (isTokenModalVisible) {
    return (
      <Modal
        open
        className="p-2"
        bannerContent={
          <div className="flex flex-row space-x-2">
            <Button
              className={cn(chainId === 0 && "ring-2 ring-border-primary")}
              variant="shadow"
              onClick={() => setChainId(0)}
            >
              All Chains
            </Button>
            {chains.map(chain => (
              <ButtonIcon
                key={chain.id}
                className={cn(
                  chainId === chain.id && "ring-2 ring-border-primary",
                )}
                variant="shadow"
                onClick={() => setChainId(chain.id)}
              >
                <ChainLogo chainId={chain.id} />
              </ButtonIcon>
            ))}
          </div>
        }
        onClose={onClose}
      >
        {renderedTokens && renderedTokens.length > 0 ? (
          <div className="">
            {renderedTokens.map(token => (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
              <div
                key={`${token.address}-${token.chain_id}`}
                className="flex cursor-pointer flex-row items-center rounded-md p-2 hover:bg-background-stronger"
                onClick={() => onTokenSelect(token)}
              >
                <TokenImage withChainLogo token={token} />
                <div className="flex grow flex-col pl-4">
                  <div className="text-text">{token.name}</div>
                  <div className="text-sm font-light text-text-weak">
                    {token.symbol}
                  </div>
                </div>
                <div className="flex-none text-sm text-text-weak">
                  {refineNumberFormat(token.amount)}
                  {` ${token.symbol}`}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-32 w-full justify-center text-center">
            <EmptyState entity="token" />
          </div>
        )}
      </Modal>
    );
  }

  return null;
};

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export default TokenModal;
