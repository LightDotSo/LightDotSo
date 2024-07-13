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

import { TokenImage } from "@lightdotso/elements";
import { useSwap } from "@lightdotso/hooks";
import {
  userOperationsParser,
  useBuySwapQueryState,
  useSellSwapQueryState,
} from "@lightdotso/nuqs";
import { useQueryLifiQuote, useQueryWalletSettings } from "@lightdotso/query";
import { swapFormSchema } from "@lightdotso/schemas";
import { useAuth, useModals } from "@lightdotso/stores";
import { cn, refineNumberFormat } from "@lightdotso/utils";
import { Button, ButtonIcon, FormField, Input } from "@lightdotso/ui";
import { ArrowDown, ChevronDown, WalletIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, type FC } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { type Address } from "viem";

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
  // Query State
  // ---------------------------------------------------------------------------

  const [buySwapQueryState, setBuySwapQueryState] = useBuySwapQueryState();
  const [sellSwapQueryState, setSellSwapQueryState] = useSellSwapQueryState();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  // The default values for the form
  const defaultValues: Partial<SwapFormValues> = useMemo(() => {
    // Check if the type is valid
    return {
      buy: buySwapQueryState ?? undefined,
      sell: sellSwapQueryState ?? undefined,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  const form = useForm<SwapFormValues>({
    mode: "all",
    reValidateMode: "onBlur",
    defaultValues: defaultValues,
  });

  const buySwap = form.watch("buy");
  const sellSwap = form.watch("sell");

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const subscription = form.watch((value, { name: _name }) => {
      // Set buy swap query state
      if (
        value.buy &&
        value.buy.token &&
        value.buy.token.address &&
        value.buy.token.value
      ) {
        setBuySwapQueryState(value.buy);
      } else {
        setBuySwapQueryState(null);
      }

      // Set sell swap query state
      if (
        value.sell &&
        value.sell.token &&
        value.sell.token.address &&
        value.sell.token.value
      ) {
        setSellSwapQueryState(value.sell);
      } else {
        setSellSwapQueryState(null);
      }

      return;
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch]);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { walletSettings } = useQueryWalletSettings({
    address: wallet as Address,
  });

  // ---------------------------------------------------------------------------
  // Next Hooks
  // ---------------------------------------------------------------------------

  const router = useRouter();

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const {
    buyToken,
    sellToken,
    buySwapAmount,
    sellSwapAmount,
    isSwapValid,
    isBuySwapLoading,
    isSellSwapLoading,
    isSwapLoading,
    userOperationsParams,
  } = useSwap({
    buySwap: buySwap,
    sellSwap: sellSwap,
  });

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { lifiQuote } = useQueryLifiQuote({
    fromAddress: wallet,
    fromChain: buyToken?.chain_id,
    fromToken: buyToken?.address as Address,
    fromAmount: buySwapAmount ?? undefined,
    toAddress: wallet,
    toChain: sellToken?.chain_id,
    toToken: sellToken?.address as Address,
  });

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (sellSwapAmount && sellToken?.decimals) {
      form.setValue(
        "sell.token.value",
        Number(Number(sellSwapAmount) / Math.pow(10, sellToken?.decimals)),
      );
    }
  }, [lifiQuote, sellSwapAmount, sellToken?.decimals]);

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isBuySwapValueValid = useMemo(() => {
    if (buyToken && buySwap?.token?.value && buySwap?.token?.decimals) {
      return (
        buySwap.token.value * Math.pow(10, buySwap.token.decimals) <=
        buyToken.amount
      );
    }
  }, [buyToken, buySwap?.token?.value, buySwap?.token?.decimals]);

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  const handleSwap = useCallback(() => {
    if (lifiQuote && lifiQuote?.transactionRequest) {
      router.push(
        `/${wallet}/create?userOperations=${userOperationsParser.serialize(userOperationsParams)}`,
      );
    }
  }, [lifiQuote, lifiQuote?.transactionRequest]);

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
            name="buy.token.value"
            render={({ field }) => (
              <Input
                disabled={isBuySwapLoading}
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
            className="gap-2 rounded-full p-1"
            size="unsized"
          >
            {buyToken && buyToken.address ? (
              <>
                <TokenImage withChainLogo token={buyToken} />
                <span
                  className={cn(
                    "max-w-24 text-2xl tracking-wide text-text",
                    buyToken.symbol.length > 6 && "truncate",
                  )}
                >
                  {buyToken.symbol}
                </span>
              </>
            ) : (
              <span className="w-full whitespace-nowrap text-lg text-text">
                Select Token
              </span>
            )}
            <ChevronDown className="mr-1 size-4 shrink-0" />
          </Button>
        </div>
        <div className="flex w-full items-center justify-between">
          <span className="truncate text-sm text-text-weak">
            $
            {buySwap && buySwap?.token?.value && buyToken
              ? refineNumberFormat(
                  (buyToken.balance_usd *
                    (buySwap.token.value * Math.pow(10, buyToken.decimals))) /
                    buyToken.amount,
                )
              : 0}{" "}
            USD
          </span>
          <Button
            onClick={() => {
              if (buyToken) {
                form.setValue(
                  "buy.token.value",
                  buyToken?.amount / Math.pow(10, buyToken.decimals),
                );
              }
            }}
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
        <ButtonIcon
          onClick={() => {
            // Swap buy and sell values
            if (buySwap.token?.value && sellSwap.token?.value) {
              // Make a copy of the values
              const buySwapTokenValue = buySwap.token.value;
              const sellSwapTokenValue = sellSwap.token.value;

              form.setValue("buy.token.value", sellSwapTokenValue);
              form.setValue("sell.token.value", buySwapTokenValue);
            }

            // Set buy values to sell
            if (buyToken) {
              form.setValue("sell.token.address", buyToken.address);
              form.setValue("sell.token.decimals", buyToken.decimals);
              form.setValue("sell.token.symbol", buyToken.symbol);
              form.setValue("sell.chainId", buyToken.chain_id);
            }

            // Set sell values to buy
            if (sellToken) {
              form.setValue("buy.token.address", sellToken.address);
              form.setValue("buy.token.decimals", sellToken.decimals);
              form.setValue("buy.token.symbol", sellToken.symbol);
              form.setValue("buy.chainId", sellToken.chain_id);
            }
          }}
          variant="shadow"
          size="sm"
        >
          <ArrowDown />
        </ButtonIcon>
      </div>
      <div className="mt-1 rounded-md border border-border-weaker bg-background-strong p-4 focus-within:ring-1 focus-within:ring-border-strong hover:border-border-weak">
        <span>Sell</span>
        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="sell.token.value"
            render={({ field }) => (
              <Input
                disabled={isSellSwapLoading}
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
            className="gap-2 rounded-full p-1"
          >
            {sellToken ? (
              <>
                <TokenImage withChainLogo token={sellToken} />
                <span
                  className={cn(
                    "max-w-24 text-2xl tracking-wide text-text",
                    sellToken.symbol.length > 6 && "truncate",
                  )}
                >
                  {sellToken.symbol}
                </span>
              </>
            ) : (
              <span className="w-full whitespace-nowrap text-lg text-text">
                Select Token
              </span>
            )}
            <ChevronDown className="mr-1 size-4 shrink-0" />
          </Button>
        </div>
        <div className="flex w-full items-center justify-between">
          <span className="truncate text-sm text-text-weak">
            $
            {sellSwap && sellSwap?.token?.value && sellToken
              ? refineNumberFormat(
                  (sellToken.balance_usd *
                    (sellSwap.token.value * Math.pow(10, sellToken.decimals))) /
                    sellToken.amount,
                )
              : 0}{" "}
            USD
          </span>
          <Button
            onClick={() => {
              if (sellToken) {
                form.setValue(
                  "sell.token.value",
                  sellToken?.amount / Math.pow(10, sellToken.decimals),
                );
              }
            }}
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
      <Button
        onClick={handleSwap}
        isLoading={isSwapLoading}
        disabled={isSwapLoading || !isSwapValid}
        size="xl"
        className="mt-1 w-full"
      >
        {isSwapLoading
          ? "Loading..."
          : isSwapValid
            ? "Swap"
            : !isBuySwapValueValid
              ? `Insufficient ${buyToken?.symbol}`
              : "Invalid Swap"}
      </Button>
    </div>
  );
};
