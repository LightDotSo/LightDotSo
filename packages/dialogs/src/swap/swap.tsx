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
  useSwapFromQueryState,
  useSwapToQueryState,
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

  const [fromSwapQueryState, setFromSwapQueryState] = useSwapFromQueryState();
  const [toSwapQueryState, setToSwapQueryState] = useSwapToQueryState();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  // The default values for the form
  const defaultValues: Partial<SwapFormValues> = useMemo(() => {
    // Check if the type is valid
    return {
      from: fromSwapQueryState ?? undefined,
      to: toSwapQueryState ?? undefined,
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

  const fromSwap = form.watch("from");
  const toSwap = form.watch("to");

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const subscription = form.watch((value, { name: _name }) => {
      // Set buy swap query state
      if (value.from && value.from.address && value.from.quantity) {
        setFromSwapQueryState(value.from);
      } else {
        setFromSwapQueryState(null);
      }

      // Set sell swap query state
      if (value.to && value.to.address && value.to.quantity) {
        setToSwapQueryState(value.to);
      } else {
        setToSwapQueryState(null);
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
    fromSwapToken,
    toSwapToken,
    fromSwapAmount,
    toSwapQuotedAmount,
    isFromSwapValueValid,
    isSwapValid,
    isFromSwapLoading,
    isToSwapLoading,
    isSwapLoading,
    userOperationsParams,
    fromSwapDecimals,
    fromSwapAmountDollarValue,
    fromSwapMaximumAmount,
    toSwapMaximumAmount,
    fromSwapMaximumQuantity,
    toSwapMaximumQuantity,
    fromSwapQuantity,
    toSwapQuantity,
    toSwapAmountDollarValue,
    toSwapDecimals,
  } = useSwap({
    fromSwap: fromSwap,
    toSwap: toSwap,
  });

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { lifiQuote } = useQueryLifiQuote({
    fromAddress: wallet,
    fromChain: fromSwap?.chainId,
    fromToken: toSwap?.address as Address,
    fromAmount: fromSwapAmount ?? undefined,
    toAddress: wallet,
    toChain: toSwap?.chainId,
    toToken: toSwap?.address as Address,
  });

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (toSwapQuotedAmount && toSwapToken?.decimals) {
      form.setValue(
        "to.quantity",
        Number(
          Number(toSwapQuotedAmount) / Math.pow(10, toSwapToken?.decimals),
        ),
      );
      form.setValue("to.amount", toSwapQuotedAmount);
    }
  }, [lifiQuote, toSwapQuotedAmount, toSwapToken?.decimals]);

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
            name="from.quantity"
            render={({ field }) => (
              <Input
                disabled={isFromSwapLoading}
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
                  form.setValue("from.address", token.address);
                  form.setValue("from.chainId", token.chain_id);

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
            {fromSwapToken && fromSwapToken.address && fromSwapToken.symbol ? (
              <>
                <TokenImage
                  withChainLogo
                  token={{
                    ...fromSwapToken,
                    amount: Number(fromSwapToken.amount),
                  }}
                />
                <span
                  className={cn(
                    "max-w-24 text-2xl tracking-wide text-text",
                    fromSwapToken.symbol.length > 6 && "truncate",
                  )}
                >
                  {fromSwapToken.symbol}
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
            {fromSwapAmountDollarValue
              ? refineNumberFormat(fromSwapAmountDollarValue)
              : 0}{" "}
            USD
          </span>
          <Button
            onClick={() => {
              if (
                fromSwapMaximumAmount &&
                fromSwapMaximumQuantity &&
                fromSwapDecimals
              ) {
                form.setValue("from.quantity", fromSwapMaximumQuantity);
                form.setValue("from.amount", fromSwapMaximumAmount);
              }
            }}
            variant="shadow"
            size="xs"
            className="gap-1 px-1 py-0"
          >
            <WalletIcon className="size-4 text-text-weak" />
            <span className="text-sm text-text-weak">Balance</span>
            <span className="text-sm text-text">
              {fromSwapQuantity ? refineNumberFormat(fromSwapQuantity) : 0}
            </span>
          </Button>
        </div>
      </div>
      <div className="z-10 -my-4 flex items-center justify-center">
        <ButtonIcon
          onClick={() => {
            // Swap buy and sell values
            if (fromSwap?.quantity && toSwap?.quantity) {
              // Make a copy of the values
              const fromSwapTokenValue = fromSwap?.quantity;
              const toSwapTokenValue = toSwap?.quantity;

              form.setValue("from.quantity", toSwapTokenValue);
              form.setValue("to.quantity", fromSwapTokenValue);
            }

            // Set buy values to sell
            if (fromSwapToken) {
              form.setValue("to.address", fromSwapToken.address);
              form.setValue("to.chainId", fromSwapToken.chain_id);
            }

            // Set sell values to buy
            if (toSwapToken) {
              form.setValue("from.address", toSwapToken.address);
              form.setValue("from.chainId", toSwapToken.chain_id);
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
            name="to.quantity"
            render={({ field }) => (
              <Input
                disabled={isToSwapLoading}
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
                  form.setValue("to.address", token.address);
                  form.setValue("to.chainId", token.chain_id);

                  form.trigger();

                  hideTokenModal();
                  toSwapToken;
                },
              });
              showTokenModal();
            }}
            variant="shadow"
            className="gap-2 rounded-full p-1"
          >
            {toSwapToken && toSwapToken.address && toSwapToken.symbol ? (
              <>
                <TokenImage
                  withChainLogo
                  token={{
                    ...toSwapToken,
                    amount: Number(toSwapToken.amount),
                  }}
                />
                <span
                  className={cn(
                    "max-w-24 text-2xl tracking-wide text-text",
                    toSwapToken.symbol.length > 6 && "truncate",
                  )}
                >
                  {toSwapToken.symbol}
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
            {toSwapAmountDollarValue
              ? refineNumberFormat(toSwapAmountDollarValue)
              : 0}{" "}
            USD
          </span>
          <Button
            onClick={() => {
              if (
                toSwapMaximumAmount &&
                toSwapMaximumQuantity &&
                toSwapDecimals
              ) {
                form.setValue("to.quantity", toSwapMaximumQuantity);
                form.setValue("to.amount", toSwapMaximumAmount);
              }
            }}
            variant="shadow"
            size="xs"
            className="gap-1 px-1 py-0"
          >
            <WalletIcon className="size-4 text-text-weak" />
            <span className="text-sm text-text-weak">Balance</span>
            <span className="text-sm text-text">
              {toSwapQuantity ? refineNumberFormat(toSwapQuantity) : 0}
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
            : !isFromSwapValueValid
              ? `Insufficient ${fromSwapToken?.symbol}`
              : "Invalid Swap"}
      </Button>
    </div>
  );
};
