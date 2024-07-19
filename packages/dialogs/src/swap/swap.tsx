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
import { ChainStack, TokenImage } from "@lightdotso/elements";
import {
  useDebouncedValue,
  useQuote,
  type QuoteParams,
} from "@lightdotso/hooks";
import { useCreate, useSwap } from "@lightdotso/hooks";
import { useSwapFromQueryState, useSwapToQueryState } from "@lightdotso/nuqs";
import { useQueryWalletSettings } from "@lightdotso/query";
import { swapFormSchema, UserOperation } from "@lightdotso/schemas";
import { generatePartialUserOperations } from "@lightdotso/sdk";
import {
  useAuth,
  useDev,
  useQuotes,
  useModals,
  useUserOperations,
} from "@lightdotso/stores";
import { getChainNameWithChainId, refineNumberFormat } from "@lightdotso/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  ButtonIcon,
  FormField,
  Input,
} from "@lightdotso/ui";
import { ArrowDown, ChevronDown, WalletIcon } from "lucide-react";
import { useEffect, useMemo, type FC } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { type Address } from "viem";
import { TokenGroup } from "../token/token-group";
import { serialize } from "@lightdotso/wagmi";
import { ChainLogo } from "@lightdotso/svg";
import { user } from "../../../query-keys/src/user";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type SwapFormValues = z.infer<typeof swapFormSchema>;

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type SwapFetcherProps = QuoteParams;

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const SwapFetcher: FC<SwapFetcherProps> = (params: SwapFetcherProps) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { setQuote } = useQuotes();
  const { setExecutionParamsByChainId } = useUserOperations();

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const { executionParams, toQuotedAmount } = useQuote(params);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (toQuotedAmount) {
      setQuote({
        fromChain: params.fromChainId,
        toChain: params.toChainId,
        fromTokenAddress: params.fromTokenAddress,
        toTokenAddress: params.toTokenAddress,
        fromAddress: params.fromAddress,
        toAddress: params.toAddress,
        fromAmount: params.fromAmount,
        toAmount: toQuotedAmount,
      });
    }
  }, [toQuotedAmount, setQuote]);

  useEffect(() => {
    if (executionParams && executionParams.length > 0) {
      setExecutionParamsByChainId(executionParams[0].chainId, executionParams);
    }
  }, [executionParams, setExecutionParamsByChainId]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return null;
};

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
  const { executionParams, resetExecutionParams } = useUserOperations();
  const { isDev } = useDev();
  const { quotes } = useQuotes();

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
    const subscription = form.watch(value => {
      // Set buy swap query state
      if (value.from) {
        setFromSwapQueryState(value.from);
      } else {
        setFromSwapQueryState(null);
      }

      // Set sell swap query state
      if (value.to) {
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
  // Hooks
  // ---------------------------------------------------------------------------

  const {
    fromToken,
    fromTokens,
    toToken,
    toSwapQuotedAmount,
    toSwapQuotedQuantity,
    isFromSwapValueValid,
    isSwapValid,
    isFromSwapLoading,
    isToSwapLoading,
    isSwapLoading,
    fromSwapDecimals,
    fromSwapQuantityDollarValue,
    fromSwapMaximumAmount,
    toSwapMaximumAmount,
    fromSwapMaximumQuantity,
    toSwapMaximumQuantity,
    fromTokenDollarRatio,
    toTokenDollarRatio,
    toSwapQuantityDollarValue,
    toSwapDecimals,
  } = useSwap({
    fromSwap: fromSwap,
    toSwap: toSwap,
  });

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // Reset the execution params when the from swap quantity, address, or chain id changes
  useEffect(() => {
    resetExecutionParams();
  }, [fromSwap?.quantity, fromSwap?.address, fromSwap?.chainId]);

  useEffect(() => {
    if (toSwapQuotedAmount && toSwapQuotedQuantity && toToken.decimals) {
      if (fromSwap.chainId === 0) {
        // Get the aggregated amount of quotes
        const aggregatedAmount = quotes.reduce((acc, quote) => {
          return acc + (quote.toAmount || 0n);
        }, 0n);

        // Divide the aggregated amount by the decimal places
        const aggregatedQuantity =
          aggregatedAmount / BigInt(Math.pow(10, toToken.decimals));

        // Set the to swap quoted amount
        form.setValue("to.quantity", Number(aggregatedQuantity));

        return;
      }

      form.setValue("to.quantity", toSwapQuotedQuantity);
    }
  }, [
    toSwapQuotedAmount,
    toSwapQuotedQuantity,
    quotes,
    fromSwap.chainId,
    toToken.decimals,
  ]);

  // ---------------------------------------------------------------------------
  // Debounced Hooks
  // ---------------------------------------------------------------------------

  const debouncedFromSwapQuantity = useDebouncedValue(fromSwap?.quantity, 500);

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const genericExecutionQuotes = useMemo(() => {
    // Initialize the token swaps
    const tokenSwaps: SwapFetcherProps[] = [];

    // If the chainId is zero, compute the required tokenAmounts to satisfy the swap
    if (
      fromSwap?.chainId === 0 &&
      debouncedFromSwapQuantity &&
      fromToken &&
      fromTokens &&
      fromTokens.length > 0
    ) {
      // Get the tokenAmounts, and fill the amount in order to fill the current swap
      let requiredSwapAmount = BigInt(
        Math.floor(
          debouncedFromSwapQuantity * Math.pow(10, fromToken.decimals),
        ),
      );

      // Iterate through the tokenAmounts, and fill the swap(s) with the required amount until the current swap is satisfied
      // Use the tokenAmount's `amount` to fill the swap
      for (const fromTokenAmount of fromTokens) {
        const currentMaxSwapAmount = fromTokenAmount.amount;

        // Get the required swap amount to satisfy the current swap
        // const currentSwapAmount = requiredSwapAmount - swapAmount;
        const currentSwapAmount =
          requiredSwapAmount >= currentMaxSwapAmount
            ? currentMaxSwapAmount
            : requiredSwapAmount;

        // Deduct the required swap amount from the current swap
        requiredSwapAmount -= currentMaxSwapAmount;

        const swap: SwapFetcherProps = {
          fromAddress: wallet as Address,
          fromChainId: fromTokenAmount.chain_id,
          fromTokenAddress: fromTokenAmount.address as Address,
          toAddress: wallet as Address,
          toChainId: toSwap?.chainId,
          toTokenAddress: toSwap?.address as Address,
          fromAmount: currentSwapAmount,
        };

        // If the swap is satisfied, break the loop
        if (requiredSwapAmount <= 0n) {
          break;
        }

        // If the swap is not satisfied, add the swap to the list
        tokenSwaps.push(swap);
      }
    }
    return tokenSwaps;
  }, [
    wallet,
    fromSwap?.chainId,
    debouncedFromSwapQuantity,
    fromTokens,
    toSwap?.address,
    toSwap?.chainId,
  ]);

  const userOperationsParams: Partial<UserOperation>[] = useMemo(() => {
    if (!wallet || !executionParams || executionParams.length === 0) {
      return [];
    }

    return generatePartialUserOperations(wallet, executionParams);
  }, [wallet, executionParams]);

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const { handleCreate } = useCreate({ userOperations: userOperationsParams });

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
                type: "swap",
                isGroup: true,
                isTestnet: walletSettings?.is_enabled_testnet ?? false,
                onClose: () => {
                  hideTokenModal();
                },
                onTokenSelect: token => {
                  // Check if the from and to swap tokens are the same
                  if (
                    toSwap?.address === token?.address &&
                    toSwap?.chainId === token?.chain_id
                  ) {
                    // Set the to swap token to null
                    form.setValue("to.address", undefined);
                    form.setValue("to.chainId", undefined);
                  }

                  // Set the from swap token
                  form.setValue("from.address", token.address);
                  form.setValue("from.chainId", token.chain_id);

                  // Set the group id
                  if (token.group) {
                    form.setValue("from.groupId", token.group.id);
                  }

                  form.trigger();

                  hideTokenModal();
                },
              });
              showTokenModal();
            }}
            variant="shadow"
            className="ml-1 inline-flex max-w-48 items-center gap-1 rounded-full p-1"
            size="unsized"
          >
            {fromSwap && fromSwap?.groupId && (
              <TokenGroup groupId={fromSwap?.groupId} />
            )}
            {fromSwap &&
              fromSwap?.chainId === 0 &&
              genericExecutionQuotes &&
              genericExecutionQuotes.length > 0 &&
              genericExecutionQuotes.map((quote, index) => (
                <SwapFetcher key={index} {...quote} />
              ))}
            {fromToken && fromToken.address && fromToken.symbol ? (
              <>
                <TokenImage
                  withChainLogo={fromToken.chain_id !== 0 ? true : false}
                  token={{
                    ...fromToken,
                    amount: Number(fromToken.amount),
                    group: undefined,
                  }}
                />
                <span className="ml-1 max-w-24 truncate text-2xl tracking-wide text-text">
                  {fromToken.symbol}
                </span>
              </>
            ) : (
              <span className="ml-1 w-full whitespace-nowrap text-lg text-text">
                Select Token
              </span>
            )}
            <ChevronDown className="mr-1 size-4 shrink-0" />
          </Button>
        </div>
        <div className="flex w-full items-center justify-between">
          <span className="truncate text-sm text-text-weak">
            {fromSwapQuantityDollarValue &&
              `$${refineNumberFormat(fromSwapQuantityDollarValue)} USD`}{" "}
            {fromTokenDollarRatio && (
              <span className="truncate text-xs text-text-weak">
                {`(1 ${fromToken?.symbol} = $${refineNumberFormat(fromTokenDollarRatio)})`}
              </span>
            )}
          </span>
          <Button
            disabled={
              !fromSwapMaximumQuantity ||
              fromSwapMaximumQuantity === 0 ||
              fromSwap?.quantity === fromSwapMaximumQuantity
            }
            onClick={() => {
              if (
                fromSwapMaximumAmount &&
                fromSwapMaximumQuantity &&
                fromSwapDecimals
              ) {
                form.setValue("from.quantity", fromSwapMaximumQuantity);
              }
            }}
            variant="shadow"
            size="xs"
            className="gap-1 px-1 py-0"
          >
            <WalletIcon className="size-4 text-text-weak" />
            <span className="text-sm text-text-weak">Balance</span>
            <span className="text-sm text-text">
              {fromSwapMaximumQuantity
                ? refineNumberFormat(fromSwapMaximumQuantity)
                : 0}
            </span>
          </Button>
        </div>
      </div>
      <div className="z-10 -my-4 flex items-center justify-center">
        <ButtonIcon
          className="ring-4 ring-background-body"
          onClick={() => {
            // Swap buy and sell values
            if (fromSwap?.quantity && toSwap?.quantity) {
              // Make a copy of the values
              const fromTokenValue = fromSwap?.quantity;
              const toTokenValue = toSwap?.quantity;

              form.setValue("from.quantity", toTokenValue);
              form.setValue("to.quantity", fromTokenValue);
            }

            // Set buy values to sell
            if (fromToken) {
              form.setValue("to.address", fromToken.address);
              form.setValue("to.chainId", fromToken.chain_id);

              // Set the group id
              if (fromToken.group) {
                form.setValue("to.groupId", fromToken.group.id);
              }
            }

            // Set sell values to buy
            if (toToken) {
              form.setValue("from.address", toToken.address);
              form.setValue("from.chainId", toToken.chain_id);

              // Set the group id
              if (toToken.group) {
                form.setValue("from.groupId", toToken.group.id);
              }
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
                type: "swap",
                isGroup: true,
                isTestnet: walletSettings?.is_enabled_testnet ?? false,
                onClose: () => {
                  hideTokenModal();
                },
                onTokenSelect: (token: TokenData) => {
                  // Check if the from and to swap tokens are the same
                  if (
                    fromSwap?.address === token?.address &&
                    fromSwap?.chainId === token?.chain_id
                  ) {
                    // Set the from swap token to null
                    form.setValue("from.address", undefined);
                    form.setValue("from.chainId", undefined);
                  }

                  // Set the to swap token
                  form.setValue("to.address", token.address);
                  form.setValue("to.chainId", token.chain_id);

                  // Set the group id
                  if (token.group) {
                    form.setValue("to.groupId", token.group.id);
                  }

                  form.trigger();

                  hideTokenModal();
                },
              });
              showTokenModal();
            }}
            variant="shadow"
            className="ml-1 inline-flex max-w-48 items-center gap-1 rounded-full p-1"
            size="unsized"
          >
            {toToken && toToken.address && toToken.symbol ? (
              <>
                <TokenImage
                  withChainLogo={toToken.chain_id !== 0 ? true : false}
                  token={{
                    ...toToken,
                    amount: Number(toToken.amount),
                    group: undefined,
                  }}
                />
                <span className="min-w-10 max-w-24 truncate text-2xl tracking-wide text-text">
                  {toToken.symbol}
                </span>
              </>
            ) : (
              <span className="ml-1 w-full whitespace-nowrap text-lg text-text">
                Select Token
              </span>
            )}
            <ChevronDown className="mr-1 size-4 shrink-0" />
          </Button>
        </div>
        <div className="flex w-full items-center justify-between">
          <span className="truncate text-sm text-text-weak">
            {toSwapQuantityDollarValue &&
              `$${refineNumberFormat(toSwapQuantityDollarValue)} USD`}{" "}
            {toTokenDollarRatio && (
              <span className="truncate text-xs text-text-weak">
                {`(1 ${toToken?.symbol} = $${refineNumberFormat(toTokenDollarRatio)})`}
              </span>
            )}
          </span>
          <Button
            disabled={
              !toSwapMaximumQuantity ||
              toSwapMaximumQuantity === 0 ||
              toSwap?.quantity === toSwapMaximumQuantity
            }
            onClick={() => {
              if (
                toSwapMaximumAmount &&
                toSwapMaximumQuantity &&
                toSwapDecimals
              ) {
                form.setValue("to.quantity", toSwapMaximumQuantity);
              }
            }}
            variant="shadow"
            size="xs"
            className="gap-1 px-1 py-0"
          >
            <WalletIcon className="size-4 text-text-weak" />
            <span className="text-sm text-text-weak">Balance</span>
            <span className="text-sm text-text">
              {toSwapMaximumQuantity
                ? refineNumberFormat(toSwapMaximumQuantity)
                : 0}
            </span>
          </Button>
        </div>
      </div>
      <Button
        onClick={handleCreate}
        isLoading={isSwapLoading}
        disabled={isSwapLoading || !isSwapValid}
        size="xl"
        className="mt-1 w-full"
      >
        {isSwapLoading
          ? "Loading..."
          : isSwapValid
            ? "Swap"
            : fromSwap?.address === undefined || fromSwap?.chainId === undefined
              ? "Select Token"
              : fromSwap?.quantity === undefined ||
                  (fromSwap?.quantity && fromSwap?.quantity === 0)
                ? "Enter Quantity"
                : !isFromSwapValueValid
                  ? `Insufficient ${fromToken?.symbol}`
                  : "Invalid Swap"}
      </Button>
      {fromSwap?.chainId === 0 &&
        genericExecutionQuotes &&
        fromTokens &&
        fromTokens.length > 0 && (
          <div className="mt-4 overflow-auto">
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <div className="inline-flex items-center">
                    <ChainStack
                      chainIds={genericExecutionQuotes.map(
                        quote => quote.fromChainId ?? 0,
                      )}
                    />
                    <span className="ml-2 text-sm text-text-weak">
                      Preparing Execution...
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="flex flex-col space-y-2">
                  {genericExecutionQuotes.map((quote, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="inline-flex items-center gap-3 truncate text-text">
                        {quote.fromChainId && (
                          <ChainLogo chainId={quote.fromChainId} />
                        )}
                        {quote.fromChainId &&
                          getChainNameWithChainId(quote.fromChainId)}
                      </span>
                      <span>
                        {refineNumberFormat(
                          Number(quote.fromAmount) /
                            Math.pow(10, fromToken.decimals),
                        )}{" "}
                        <span className="text-text">{fromToken.symbol}</span>
                      </span>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      {isDev && (
        <div className="mt-4 overflow-auto max-w-md max-h-96">
          <pre className="break-all text-xs text-text-weak">
            {serialize({
              fromSwapQueryState: fromSwapQueryState,
              toSwapQueryState: toSwapQueryState,
              fromSwap: fromSwap,
              toSwap: toSwap,
              fromToken: fromToken,
              toToken: toToken,
              fromTokens: fromTokens,
              toSwapQuotedAmount: toSwapQuotedAmount,
              toSwapQuotedQuantity: toSwapQuotedQuantity,
              isFromSwapValueValid: isFromSwapValueValid,
              isSwapValid: isSwapValid,
              isFromSwapLoading: isFromSwapLoading,
              isToSwapLoading: isToSwapLoading,
              isSwapLoading: isSwapLoading,
              executionParams: executionParams,
              fromSwapDecimals: fromSwapDecimals,
              fromSwapQuantityDollarValue: fromSwapQuantityDollarValue,
              fromSwapMaximumAmount: fromSwapMaximumAmount,
              toSwapMaximumAmount: toSwapMaximumAmount,
              fromSwapMaximumQuantity: fromSwapMaximumQuantity,
              toSwapMaximumQuantity: toSwapMaximumQuantity,
              fromTokenDollarRatio: fromTokenDollarRatio,
              toTokenDollarRatio: toTokenDollarRatio,
              toSwapQuantityDollarValue: toSwapQuantityDollarValue,
              toSwapDecimals: toSwapDecimals,
            })}
          </pre>
        </div>
      )}
    </div>
  );
};
