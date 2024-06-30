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
import { useContainerDimensions, useMediaQuery } from "@lightdotso/hooks";
import { useQuerySocketBalances, useQueryTokens } from "@lightdotso/query";
import { useModals } from "@lightdotso/stores";
import { ChainLogo } from "@lightdotso/svg";
import { Modal } from "@lightdotso/templates";
import {
  Button,
  ButtonIcon,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@lightdotso/ui";
import { cn, refineNumberFormat } from "@lightdotso/utils";
import { type FC, useMemo, useRef, useState } from "react";
import type { Address } from "viem";

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
  // Ref Hooks
  // ---------------------------------------------------------------------------

  const containerRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const isDesktop = useMediaQuery("md");
  const dimensions = useContainerDimensions(containerRef);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { tokens } = useQueryTokens({
    address: address as Address,
    is_testnet: isTestnet ?? false,
    limit: Number.MAX_SAFE_INTEGER,
    offset: 0,
    group: false,
    chain_ids: null,
  });

  const { balances } = useQuerySocketBalances({
    address: address as Address,
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

  const renderedChains = useMemo(() => {
    // Get the available width for the chains, adjusting for the two buttons `px-20` and the padding `px-4`
    const availableWidth = dimensions?.width - 240;

    // Calculate the number of chains that can fit in the available width
    const availableChains = availableWidth / (36 + 4);

    return chains.slice(0, availableChains);
  }, [dimensions]);

  const renderedTokens: TokenData[] = useMemo(() => {
    // Light index tokens
    if (type === "native") {
      const filtered_tokens =
        tokens && chainId > 0
          ? tokens.filter(token => token.chain_id === chainId)
          : tokens;

      return filtered_tokens
        ? filtered_tokens.map(token => ({
            ...token,
            amount: token.amount / Math.pow(10, token.decimals),
          }))
        : [];
    }

    // Socket balances
    const filtered_balances =
      // Filter the balances by chain that is in the `MAINNET_CHAINS` array
      balances
        ? balances
            .filter(balance => {
              const chain = chains.find(chain => chain.id === balance.chainId);
              return chain !== undefined;
            })
            .filter(balance => {
              return chainId === 0 || balance.chainId === chainId;
            })
        : [];

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
  }, [balances, chainId, tokens, type, chains]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (isTokenModalVisible) {
    return (
      <Modal
        open
        isHeightFixed
        className="p-2"
        bannerContent={
          <TooltipProvider delayDuration={300}>
            <div
              ref={containerRef}
              className="flex w-full flex-row space-x-2 p-2"
            >
              <Button
                className={cn(
                  "w-28 shrink-0",
                  chainId === 0 && "ring-2 ring-border-strong",
                )}
                variant="shadow"
                onClick={() => setChainId(0)}
              >
                All Chains
              </Button>
              {renderedChains.map(chain => (
                <Tooltip key={chain.id}>
                  <TooltipTrigger asChild>
                    <ButtonIcon
                      size="default"
                      className={cn(
                        "shrink-0",
                        chainId === chain.id && "ring-2 ring-border-strong",
                      )}
                      variant="shadow"
                      onClick={() => setChainId(chain.id)}
                    >
                      <ChainLogo chainId={chain.id} />
                    </ButtonIcon>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{chain.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
              <Button className="grow" variant="outline">
                More
              </Button>
            </div>
          </TooltipProvider>
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
          <div className="flex size-full items-center justify-center text-center">
            <EmptyState entity="token" size={isDesktop ? "xl" : "default"} />
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
