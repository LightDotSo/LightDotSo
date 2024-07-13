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
import { TokenImage } from "@lightdotso/elements";
import { useQueryToken, useQueryWalletSettings } from "@lightdotso/query";
import { swapFormSchema } from "@lightdotso/schemas";
import { useAuth, useModals } from "@lightdotso/stores";
import { Button, ButtonIcon, FormField, Input } from "@lightdotso/ui";
import { ArrowDown, ChevronDown, WalletIcon } from "lucide-react";
import { useMemo, type FC } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Address } from "viem";
import { refineNumberFormat } from "@lightdotso/utils";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type SwapFormValues = z.infer<typeof swapFormSchema>;

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type SwapDialogProps = {
  className?: string;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const SwapDialog: FC<SwapDialogProps> = ({ className }) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { wallet } = useAuth();
  const { showTokenModal, setTokenModalProps, hideTokenModal } = useModals();

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  const form = useForm<SwapFormValues>({
    mode: "all",
    reValidateMode: "onBlur",
  });

  const buySwap = form.watch("buy");
  const sellSwap = form.watch("sell");

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { token: buyQueryToken } = useQueryToken({
    address: (buySwap?.token?.address as Address) ?? undefined,
    chain_id: buySwap?.chainId,
    wallet: wallet as Address,
  });

  const { token: sellQueryToken } = useQueryToken({
    address: (sellSwap?.token?.address as Address) ?? undefined,
    chain_id: sellSwap?.chainId,
    wallet: wallet as Address,
  });

  const { walletSettings } = useQueryWalletSettings({
    address: wallet as Address,
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const buyToken: TokenData | null = useMemo(() => {
    if (buyQueryToken) {
      return buyQueryToken;
    }

    if (
      buySwap?.token?.address &&
      buySwap?.chainId &&
      buySwap?.token?.symbol &&
      buySwap?.token?.decimals
    ) {
      const buySwapToken: TokenData = {
        amount: 0,
        balance_usd: 0,
        id: `${buySwap?.token?.address}-${buySwap?.chainId}`,
        address: buySwap?.token?.address as Address,
        chain_id: buySwap?.chainId,
        decimals: buySwap?.token?.decimals,
        symbol: buySwap?.token?.symbol,
      };
      return buySwapToken;
    }

    return null;
  }, [buyQueryToken]);
  console.log(buyToken);

  const sellToken: TokenData | null = useMemo(() => {
    if (sellQueryToken) {
      return sellQueryToken;
    }

    if (
      sellSwap?.token?.address &&
      sellSwap?.chainId &&
      sellSwap?.token?.symbol &&
      sellSwap?.token?.decimals
    ) {
      const sellSwapToken: TokenData = {
        amount: 0,
        balance_usd: 0,
        id: `${sellSwap?.token?.address}-${sellSwap?.chainId}`,
        address: sellSwap?.token?.address as Address,
        chain_id: sellSwap?.chainId,
        decimals: sellSwap?.token?.decimals,
        symbol: sellSwap?.token?.symbol,
      };
      return sellSwapToken;
    }

    return null;
  }, [sellQueryToken]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className={className}>
      <div className="rounded-md border border-border-weaker bg-background-strong p-4 focus-within:ring-1 focus-within:ring-border-strong hover:border-border-weak">
        <span>Buy</span>
        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="buy.token.quantity"
            render={({ field }) => (
              <Input
                placeholder="0"
                className="h-16 truncate border-0 bg-background-strong p-0 text-4xl [appearance:textfield] focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                type="number"
                {...field}
              />
            )}
          />
          <Button
            onClick={() => {
              setTokenModalProps({
                address: wallet as Address,
                type: "native",
                isTestnet: walletSettings?.is_enabled_testnet ?? false,
                onClose: () => {
                  hideTokenModal();
                },
                onTokenSelect: token => {
                  form.setValue("buy.token.address", token.address);
                  form.setValue("buy.token.decimals", token.decimals);
                  form.setValue("buy.token.symbol", token.symbol);
                  form.setValue("buy.chainId", token.chain_id);

                  form.trigger();

                  hideTokenModal();
                },
              });
              showTokenModal();
            }}
            variant="shadow"
            className="gap-2 rounded-full px-1"
          >
            {buyToken && buyToken.address ? (
              <>
                <TokenImage withChainLogo token={buyToken} />
                <span className="max-w-10 whitespace-nowrap break-all text-2xl tracking-wide text-text">
                  {buyToken.symbol}
                </span>
              </>
            ) : (
              <span className="whitespace-nowrap text-lg text-text">
                Select Token
              </span>
            )}
            <ChevronDown className="mr-1 size-4 shrink-0" />
          </Button>
        </div>
        <div className="flex w-full items-center justify-between">
          <span className="text-sm text-text-weak">
            ${buyToken ? refineNumberFormat(buyToken.balance_usd) : 0} USD
          </span>
          <Button
            onClick={() =>
              form.setValue("buy.token.quantity", buyToken?.amount)
            }
            variant="shadow"
            size="xs"
            className="gap-1 px-1 py-0"
          >
            <WalletIcon className="size-4 text-text-weak" />
            <span className="text-sm text-text-weak">Balance</span>
            <span className="text-sm text-text">
              {buyToken
                ? refineNumberFormat(
                    buyToken.amount / Math.pow(10, buyToken.decimals),
                  )
                : 0}
            </span>
          </Button>
        </div>
      </div>
      <div className="z-10 -my-4 flex items-center justify-center">
        <ButtonIcon onClick={showTokenModal} variant="shadow" size="sm">
          <ArrowDown />
        </ButtonIcon>
      </div>
      <div className="mt-1 rounded-md border border-border-weaker bg-background-strong p-4 focus-within:ring-1 focus-within:ring-border-strong hover:border-border-weak">
        <span>Sell</span>
        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="sell.token.quantity"
            render={({ field }) => (
              <Input
                placeholder="0"
                className="h-16 truncate border-0 bg-background-strong p-0 text-4xl [appearance:textfield] focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                type="number"
                {...field}
              />
            )}
          />
          <Button
            onClick={() => {
              setTokenModalProps({
                address: wallet as Address,
                type: "native",
                isTestnet: walletSettings?.is_enabled_testnet ?? false,
                onClose: () => {
                  hideTokenModal();
                },
                onTokenSelect: token => {
                  form.setValue("sell.token.address", token.address);
                  form.setValue("sell.token.decimals", token.decimals);
                  form.setValue("sell.token.symbol", token.symbol);
                  form.setValue("sell.chainId", token.chain_id);

                  form.trigger();

                  hideTokenModal();
                  sellToken;
                },
              });
              showTokenModal();
            }}
            variant="shadow"
            className="gap-2 rounded-full px-1"
          >
            {sellToken ? (
              <>
                <TokenImage withChainLogo token={sellToken} />
                <span className="max-w-10 whitespace-nowrap break-all text-2xl tracking-wide text-text">
                  {sellToken.symbol}
                </span>
              </>
            ) : (
              <span className="whitespace-nowrap text-lg text-text">
                Select Token
              </span>
            )}
            <ChevronDown className="mr-1 size-4 shrink-0" />
          </Button>
        </div>
        <div className="flex w-full items-center justify-between">
          <span className="text-sm text-text-weak">
            ${sellToken ? refineNumberFormat(sellToken.balance_usd) : 0} USD
          </span>
          <Button
            onClick={() =>
              form.setValue("sell.token.quantity", sellToken?.amount)
            }
            variant="shadow"
            size="xs"
            className="gap-1 px-1 py-0"
          >
            <WalletIcon className="size-4 text-text-weak" />
            <span className="text-sm text-text-weak">Balance</span>
            <span className="text-sm text-text">
              {sellToken
                ? refineNumberFormat(
                    sellToken.amount / Math.pow(10, sellToken.decimals),
                  )
                : 0}
            </span>
          </Button>
        </div>
      </div>
      <Button disabled size="lg" className="mt-1 w-full">
        Swap
      </Button>
    </div>
  );
};
