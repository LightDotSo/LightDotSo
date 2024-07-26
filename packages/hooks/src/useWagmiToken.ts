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

import { useBalance, useReadContract } from "@lightdotso/wagmi";
import { useMemo } from "react";
import { type Address, erc20Abi } from "viem";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type WagmiToken = {
  balance: bigint | undefined;
  decimals: number | undefined;
  symbol: string | undefined;
};

// -----------------------------------------------------------------------------
// Hook Props
// -----------------------------------------------------------------------------

type WagmiTokenProps = {
  address: Address;
  chainId: number | undefined;
  tokenAddress: Address | undefined;
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useWagmiToken = ({
  address,
  chainId,
  tokenAddress,
}: WagmiTokenProps): {
  wagmiToken: WagmiToken;
  isWagmiTokenLoading: boolean;
} => {
  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  const {
    data: wagmiTokenNativeBalance,
    isLoading: isWagmiTokenNativeBalanceLoading,
  } = useBalance({
    address: address as Address,
    chainId: chainId,
    query: {
      enabled: Boolean(
        tokenAddress &&
          tokenAddress === "0x0000000000000000000000000000000000000000" &&
          chainId &&
          chainId > 0,
      ),
    },
  });

  const { data: wagmiTokenBalance, isLoading: isWagmiTokenBalanceLoading } =
    useReadContract({
      address: tokenAddress as Address,
      chainId: chainId,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address as Address],
      query: {
        enabled: Boolean(
          tokenAddress &&
            tokenAddress !== "0x0000000000000000000000000000000000000000" &&
            chainId &&
            chainId > 0,
        ),
      },
    });

  const { data: wagmiTokenDecimals, isLoading: isWagmiTokenDecimalsLoading } =
    useReadContract({
      address: tokenAddress as Address,
      chainId: chainId,
      abi: erc20Abi,
      functionName: "decimals",
      query: {
        enabled: Boolean(
          tokenAddress &&
            tokenAddress !== "0x0000000000000000000000000000000000000000" &&
            chainId &&
            chainId > 0,
        ),
      },
    });

  const { data: wagmiTokenSymbol, isLoading: isWagmiTokenSymbolLoading } =
    useReadContract({
      address: tokenAddress as Address,
      chainId: chainId,
      abi: erc20Abi,
      functionName: "symbol",
      query: {
        enabled: Boolean(
          tokenAddress &&
            tokenAddress !== "0x0000000000000000000000000000000000000000" &&
            chainId &&
            chainId > 0,
        ),
      },
    });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isWagmiTokenLoading = useMemo(() => {
    return (
      isWagmiTokenBalanceLoading ||
      isWagmiTokenNativeBalanceLoading ||
      isWagmiTokenDecimalsLoading ||
      isWagmiTokenSymbolLoading
    );
  }, [
    isWagmiTokenBalanceLoading,
    isWagmiTokenNativeBalanceLoading,
    isWagmiTokenDecimalsLoading,
    isWagmiTokenSymbolLoading,
  ]);

  const wagmiToken = useMemo(() => {
    return {
      balance:
        address === "0x0000000000000000000000000000000000000000"
          ? wagmiTokenNativeBalance?.value
          : wagmiTokenBalance,
      decimals:
        address === "0x0000000000000000000000000000000000000000"
          ? wagmiTokenNativeBalance?.decimals
          : wagmiTokenDecimals,
      symbol:
        address === "0x0000000000000000000000000000000000000000"
          ? wagmiTokenNativeBalance?.symbol
          : wagmiTokenSymbol,
    };
  }, [
    address,
    wagmiTokenBalance,
    wagmiTokenDecimals,
    wagmiTokenSymbol,
    wagmiTokenNativeBalance,
  ]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    wagmiToken: wagmiToken,
    isWagmiTokenLoading: isWagmiTokenLoading,
  };
};
