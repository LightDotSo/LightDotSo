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

import { CHAINS, LIGHT_CHAIN, MAINNET_CHAINS } from "@lightdotso/const";
import type { TokenData } from "@lightdotso/data";
import { TokenImage } from "@lightdotso/elements";
import { useContainerDimensions, useDebouncedValue } from "@lightdotso/hooks";
import { useChainQueryState } from "@lightdotso/nuqs";
import {
  useQueryLifiTokens,
  useQuerySocketBalances,
  useQueryTokens,
} from "@lightdotso/query";
import { useModals } from "@lightdotso/stores";
import { ChainLogo } from "@lightdotso/svg";
import { Modal, TokenGroup } from "@lightdotso/templates";
import {
  Button,
  ButtonIcon,
  Command,
  CommandGroup,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@lightdotso/ui";
import { cn, refineNumberFormat } from "@lightdotso/utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import { SparklesIcon } from "lucide-react";
import { type FC, useCallback, useMemo, useRef } from "react";
import type { Address } from "viem";
import { TokenModalGroupHoverCard } from "./token-modal-group-hover-card";
export const TokenModal: FC = () => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const {
    showChainModal,
    tokenModalProps: {
      address,
      isGroup,
      isTestnet,
      onClose,
      onTokenSelect,
      type,
    },
    isTokenModalVisible,
  } = useModals();

  // ---------------------------------------------------------------------------
  // Ref Hooks
  // ---------------------------------------------------------------------------

  const containerRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const dimensions = useContainerDimensions(containerRef);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { tokens, isTokensLoading } = useQueryTokens({
    address: address as Address,
    is_testnet: isTestnet ?? false,
    limit: Number.MAX_SAFE_INTEGER,
    offset: 0,
    group: false,
    chain_ids: null,
  });

  const { tokens: groupTokens, isTokensLoading: isGroupTokensLoading } =
    useQueryTokens({
      address: address as Address,
      is_group_only: true,
      is_testnet: isTestnet ?? false,
      limit: Number.MAX_SAFE_INTEGER,
      offset: 0,
      group: true,
      chain_ids: null,
    });

  const { lifiTokens, isLifiTokensLoading } = useQueryLifiTokens();

  const { socketBalances, isSocketBalancesLoading } = useQuerySocketBalances({
    address: address as Address,
  });

  // ---------------------------------------------------------------------------
  // Query State Hooks
  // ---------------------------------------------------------------------------

  const [chainState, setChainState] = useChainQueryState();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const chains = useMemo(() => {
    if (isTestnet) {
      if (isGroup) {
        return [LIGHT_CHAIN, ...CHAINS];
      }
      return CHAINS;
    }

    if (isGroup) {
      return [LIGHT_CHAIN, ...MAINNET_CHAINS];
    }

    return MAINNET_CHAINS;
  }, [isTestnet, isGroup]);

  const renderedChains = useMemo(() => {
    // Get the available width for the chains, adjusting for the two buttons `px-20` and the padding `px-4`
    const availableWidth = dimensions?.width - 240;

    // Calculate the number of chains that can fit in the available width
    const availableChains = availableWidth / (36 + 4);

    // If chainState is null, return all chains
    if (chainState === null) {
      return chains.slice(0, availableChains);
    }

    // Check if the chainState is in the available chains
    const availableChainState = chains
      .slice(0, availableChains)
      .find((chain) => chain.id === chainState.id);

    // If the chainState is not in the available chains, add the chainState chain to the front and remove the last chain
    if (!availableChainState) {
      return [chainState, ...chains.slice(0, availableChains - 1)];
    }

    // Return the available chains
    return chains.slice(0, availableChains);
  }, [dimensions?.width, chains, chainState]);

  const lightTokens: TokenData[] = useMemo(() => {
    if (chainState && chainState.id === 0 && groupTokens) {
      return groupTokens;
    }

    const filteredTokens =
      tokens && tokens?.length > 0 && chainState
        ? tokens.filter((token) => token.chain_id === chainState.id)
        : tokens;

    const lightIndexedTokens =
      filteredTokens && filteredTokens?.length > 0 ? filteredTokens : [];

    return lightIndexedTokens;
  }, [tokens, groupTokens, chainState]);

  const lifi_tokens: TokenData[] = useMemo(() => {
    // Lifi tokens
    const filteredLifiTokens =
      // Filter the tokens by chain that is in the `MAINNET_CHAINS` array
      lifiTokens && lifiTokens?.length > 0
        ? lifiTokens.filter((token) => {
            return chainState === null || token.chainId === chainState.id;
          })
        : [];

    // Map the tokens to tokens
    const lifi_tokens = filteredLifiTokens.map((token) => ({
      id: `${token.chainId}-${token.address}-${token.decimals}`,
      chain_id: token.chainId ?? 0,
      balance_usd: 0,
      address: token.address ?? "0x",
      amount: 0,
      decimals: token.decimals ?? 0,
      name: token.name ?? "",
      symbol: token.symbol ?? "",
    }));

    return lifi_tokens;
  }, [lifiTokens, chainState]);

  const overlayTokens = useMemo(() => {
    // Overlay light tokens amounts and balances on lifi tokens
    const overlayedTokens = lightTokens.map((lightToken) => {
      const lifiToken = lifi_tokens.find(
        (token) =>
          token.address === lightToken.address &&
          token.chain_id === lightToken.chain_id,
      );

      if (lifiToken) {
        return {
          ...lifiToken,
          ...lightToken,
          name: lifiToken.name,
        };
      }

      return lightToken;
    });

    // Remove the overlayed tokens from the lifi tokens
    const duplicatedLifiTokens = lifi_tokens.filter(
      (token) =>
        !overlayedTokens.find(
          (overlayedToken) =>
            overlayedToken.address === token.address &&
            overlayedToken.chain_id === token.chain_id,
        ),
    );

    // Combine the overlayed tokens and the lifi tokens to the front
    const overlay_tokens = [...overlayedTokens, ...duplicatedLifiTokens];

    return overlay_tokens;
  }, [lightTokens, lifi_tokens]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const socketTokens = useMemo(() => {
    // Socket balances
    const filteredBalances =
      // Filter the balances by chain that is in the `MAINNET_CHAINS` array
      socketBalances && socketBalances?.length > 0
        ? socketBalances
            .filter((balance) => {
              const chain = chains.find(
                (chain) => chain.id === balance.chainId,
              );
              return chain !== undefined;
            })
            .filter((balance) => {
              return chainState === null || balance.chainId === chainState.id;
            })
        : [];

    // Map the balances to tokens
    const socket_tokens = filteredBalances.map((balance) => ({
      id: `${balance.chainId}-${balance.address}-${balance.decimals}`,
      chain_id: balance.chainId,
      balance_usd: 0,
      address: balance.address,
      amount: balance.amount * 10 ** balance.decimals,
      decimals: balance.decimals,
      name: balance.name,
      symbol: balance.symbol,
    }));

    return socket_tokens;
  }, [socketBalances, chainState]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const renderedTokens: TokenData[] = useMemo(() => {
    if (type === "light") {
      return lightTokens;
    }

    // Also, return the overlayed tokens early if the type is swap
    if (type === "swap") {
      return overlayTokens;
    }

    return socketTokens;
  }, [lightTokens, overlayTokens, lifi_tokens, socketTokens, type]);

  // ---------------------------------------------------------------------------
  // Debounced Hooks
  // ---------------------------------------------------------------------------

  const [debouncedIsTokenModalVisible] = useDebouncedValue(
    isTokenModalVisible,
    300,
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const _isTokenModalLoading = useMemo(() => {
    return (
      isTokensLoading ||
      isGroupTokensLoading ||
      isLifiTokensLoading ||
      isSocketBalancesLoading ||
      !debouncedIsTokenModalVisible
    );
  }, [
    isTokensLoading,
    isGroupTokensLoading,
    isLifiTokensLoading,
    isSocketBalancesLoading,
  ]);

  // ---------------------------------------------------------------------------
  // Ref Hooks
  // ---------------------------------------------------------------------------

  const parentRef = useRef(null);

  // ---------------------------------------------------------------------------
  // Virtualizer
  // ---------------------------------------------------------------------------

  const virtualizer = useVirtualizer({
    count: renderedTokens.length,
    getScrollElement: () => parentRef.current,
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    estimateSize: useCallback(
      () => 60,
      [
        renderedTokens.length,
        isTokenModalVisible,
        debouncedIsTokenModalVisible,
      ],
    ),
    overscan: 30,
  });

  const virtualTokens = virtualizer.getVirtualItems();

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  // const handleSearch = (search: string) =>
  //   useCallback(() => {
  //     setFilteredTokens(
  //       renderedTokens.filter(token =>
  //         token.symbol.toLowerCase().includes(search.toLowerCase() ?? []),
  //       ),
  //     );
  //   }, [renderedTokens]);

  const _handleKeyDown = (event: React.KeyboardEvent) =>
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useCallback(() => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
      }
    }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Modal
      isHeightFixed
      open={isTokenModalVisible}
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
                chainState === null && "ring-2 ring-border-strong",
              )}
              variant="shadow"
              onClick={() => setChainState(null)}
            >
              All Chains
            </Button>
            {renderedChains.map((chain) => (
              <Tooltip key={chain.id}>
                <TooltipTrigger asChild>
                  <ButtonIcon
                    size="default"
                    className={cn(
                      "shrink-0",
                      chainState &&
                        chainState.id === chain.id &&
                        "ring-2 ring-border-strong",
                    )}
                    variant="shadow"
                    onClick={() => setChainState(chain)}
                  >
                    {chain.id === 0 ? (
                      <SparklesIcon className="size-4" />
                    ) : (
                      <ChainLogo chainId={chain.id} />
                    )}
                  </ButtonIcon>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{chain.name}</p>
                </TooltipContent>
              </Tooltip>
            ))}
            <Button onClick={showChainModal} className="grow" variant="outline">
              More
            </Button>
          </div>
        </TooltipProvider>
      }
      onClose={onClose}
    >
      <Command className="bg-transparent">
        <CommandGroup
          heading="My Tokens"
          ref={parentRef}
          style={{
            height: "1000px",
            width: "100%",
            overflow: "auto",
          }}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualTokens.map((virtualToken) => {
              const token = renderedTokens[virtualToken.index];

              if (!token) {
                return null;
              }

              return (
                <TokenModalGroupHoverCard
                  key={virtualToken.key}
                  groupId={
                    chainState && chainState.id === 0
                      ? token?.group?.id
                      : undefined
                  }
                >
                  {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualToken.size}px`,
                      transform: `translateY(${virtualToken.start}px)`,
                      padding: 8,
                    }}
                    className="flex cursor-pointer flex-row items-center rounded-md hover:bg-background-stronger"
                    onClick={() => onTokenSelect(token)}
                  >
                    {token?.group?.id && (
                      <TokenGroup groupId={token?.group?.id} />
                    )}
                    <TokenImage
                      withChainLogo={token.chain_id !== 0}
                      token={token}
                    />
                    <div className="flex grow flex-col pl-4">
                      <div className="text-text">{token?.name}</div>
                      <div className="font-light text-sm text-text-weak">
                        {token?.symbol}
                      </div>
                    </div>
                    <div className="flex-none text-sm text-text-weak">
                      {token?.amount &&
                        token.decimals &&
                        token?.decimals !== 0 &&
                        refineNumberFormat(
                          token?.amount / 10 ** token?.decimals,
                        )}
                      {` ${token?.symbol}`}
                    </div>
                  </div>
                </TokenModalGroupHoverCard>
              );
            })}
          </div>
        </CommandGroup>
      </Command>
    </Modal>
  );
};

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export default TokenModal;
