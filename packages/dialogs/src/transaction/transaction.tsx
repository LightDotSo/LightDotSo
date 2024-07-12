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
import {
  useUserOperationsCreate,
  useUserOperationsCreateState,
} from "@lightdotso/hooks";
import { useUserOperationsQueryState } from "@lightdotso/nuqs";
import { useQueryTokens } from "@lightdotso/query";
import { transactionFormSchema } from "@lightdotso/schemas";
import {
  useDev,
  useFormRef,
  useModalSwiper,
  useModals,
  useUserOperations,
} from "@lightdotso/stores";
import { ChainLogo } from "@lightdotso/svg";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Form,
  FormItem,
  FormField,
  FormControl,
  Checkbox,
  FormLabel,
  Label,
  toast,
  Button,
} from "@lightdotso/ui";
import { cn, getChainWithChainId } from "@lightdotso/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, type FC } from "react";
import { useForm } from "react-hook-form";
import { usePathname } from "next/navigation";
import type { Address } from "viem";
import type * as z from "zod";
import {
  FooterButton,
  Loading,
  useIsInsideModal,
  ModalSwiper,
} from "@lightdotso/templates";
import { TransactionCalldata } from "./transaction-calldata";
import { TransactionDetails } from "./transaction-details";
import { TransactionFetcher } from "./transaction-fetcher";
import { TransactionStatus } from "./transaction-status";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type TransactionDialogProps = {
  address: Address;
};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TransactionDialog: FC<TransactionDialogProps> = ({ address }) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { pageIndex, setPageIndex } = useModalSwiper();
  const { resetAll } = useUserOperations();
  const {
    customFormSuccessText,
    isFormLoading,
    isFormDisabled,
    setIsFormDisabled,
  } = useFormRef();
  const { isDev } = useDev();
  const {
    setTokenModalProps,
    showTokenModal,
    hideTokenModal,
    setCreateBackgroundModal,
  } = useModals();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { tokens } = useQueryTokens({
    address: address as Address,
    is_testnet: false,
    offset: 0,
    limit: Number.MAX_SAFE_INTEGER,
    group: false,
    chain_ids: null,
  });

  // ---------------------------------------------------------------------------
  // Query State Hooks
  // ---------------------------------------------------------------------------

  const [userOperationsQueryState] = useUserOperationsQueryState();

  // ---------------------------------------------------------------------------
  // Local Hooks
  // ---------------------------------------------------------------------------

  const isInsideModal = useIsInsideModal();

  // ---------------------------------------------------------------------------
  // Next Hooks
  // ---------------------------------------------------------------------------

  const pathname = usePathname();

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const { isUserOperationsCreateLoading, isUserOperationsCreateSuccess } =
    useUserOperationsCreateState();

  const {
    isUserOperationsCreateSubmittable,
    isUserOperationsDisabled,
    signUserOperations,
  } = useUserOperationsCreate({
    address: address as Address,
  });

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // If the transaction is disabled, set the form disabled to true
  useEffect(() => {
    setIsFormDisabled(isUserOperationsDisabled);
  }, [isUserOperationsDisabled, setIsFormDisabled]);

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const defaultValues: TransactionFormValues = useMemo(() => {
    return {
      isDirectSubmit: isUserOperationsCreateSubmittable,
    };
  }, [isUserOperationsCreateSubmittable]);

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  const form = useForm<TransactionFormValues>({
    mode: "all",
    reValidateMode: "onBlur",
    // @ts-expect-error
    resolver: zodResolver(transactionFormSchema, defaultValues),
  });

  const watchIsDirectSubmit = form.watch("isDirectSubmit");

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // Change the page index depending on the sign loading state
  useEffect(() => {
    if (isUserOperationsCreateLoading) {
      setPageIndex(1);
    } else {
      setPageIndex(0);
    }
  }, [isUserOperationsCreateLoading, setPageIndex]);

  // Change the page index depending on the sign success state
  useEffect(() => {
    if (isUserOperationsCreateSuccess && watchIsDirectSubmit) {
      setPageIndex(2);
    }
  }, [isUserOperationsCreateSuccess, watchIsDirectSubmit, setPageIndex]);

  // On pathname change, reset all user operations
  useEffect(() => {
    resetAll();
    setPageIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, resetAll, setPageIndex]);

  // Sync the `isDirectSubmit` field with the `isUserOperationCreateSubmittable` value
  useEffect(() => {
    form.setValue("isDirectSubmit", isUserOperationsCreateSubmittable);
  }, [form, isUserOperationsCreateSubmittable]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      <div className="flex w-full items-center">
        <ModalSwiper>
          {pageIndex === 0 && (
            // eslint-disable-next-line react/jsx-no-useless-fragment
            <>
              <Tabs className="w-full" defaultValue="transaction">
                <TabsList className="sticky w-full">
                  <TabsTrigger
                    className={cn(!isDev ? "w-1/3" : "w-1/4")}
                    value="transaction"
                  >
                    Transaction
                  </TabsTrigger>
                  <TabsTrigger
                    className={cn(!isDev ? "w-1/3" : "w-1/4")}
                    value="details"
                  >
                    Details
                  </TabsTrigger>
                  <TabsTrigger
                    className={cn(!isDev ? "w-1/3" : "w-1/4")}
                    value="data"
                  >
                    Data
                  </TabsTrigger>
                  {isDev && (
                    <TabsTrigger className="w-1/4" value="dev">
                      Dev
                    </TabsTrigger>
                  )}
                </TabsList>
                <TabsContent
                  className={cn(isInsideModal && "h-72 overflow-y-auto")}
                  value="transaction"
                >
                  <div className="space-y-3 pt-3">
                    <TransactionDetails />
                    <Form {...form}>
                      <form className="space-y-4">
                        <FormField
                          control={form.control}
                          name="gas.asset.quantity"
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          render={({ field: _field }) => {
                            // Get the matching token
                            const token =
                              tokens &&
                              tokens?.find(
                                token =>
                                  token.address ===
                                    (form.getValues("gas.asset.address") ||
                                      "") &&
                                  token.chain_id ===
                                    form.getValues("gas.chainId"),
                              );

                            return (
                              <FormControl>
                                <div className="flex flex-col space-y-3">
                                  <div className="w-full space-y-2">
                                    <Label htmlFor="weight">Gas Token</Label>
                                    <Button
                                      size="lg"
                                      type="button"
                                      variant="outline"
                                      className="flex w-full items-center justify-between px-4 text-sm"
                                      onClick={() => {
                                        if (!address) {
                                          toast.error(
                                            "Please connect your wallet to proceed!",
                                          );
                                          return;
                                        }

                                        setTokenModalProps({
                                          address: address as Address,
                                          type: "native",
                                          isTestnet: false,
                                          onClose: () => {
                                            hideTokenModal();
                                            setCreateBackgroundModal(false);
                                          },
                                          onTokenSelect: token => {
                                            form.setValue(
                                              "gas.chainId",
                                              token.chain_id,
                                            );
                                            form.setValue(
                                              "gas.asset.address",
                                              token.address,
                                            );
                                            form.setValue(
                                              "gas.asset.decimals",
                                              token.decimals,
                                            );
                                            form.setValue(
                                              "gas.assetType",
                                              "erc20",
                                            );

                                            if (
                                              !form.getValues(
                                                "gas.asset.quantity",
                                              )
                                            ) {
                                              form.setValue(
                                                "gas.asset.quantity",
                                                0,
                                              );
                                            }

                                            form.trigger();

                                            hideTokenModal();
                                            if (isInsideModal) {
                                              setCreateBackgroundModal(false);
                                            }

                                            // const quantity =
                                            //   form.getValues(
                                            //     "gas.asset.quantity",
                                            //   );
                                            // if (quantity) {
                                            //   validateTokenQuantity(quantity);
                                            // }
                                          },
                                        });

                                        setCreateBackgroundModal(true);
                                        showTokenModal();
                                      }}
                                    >
                                      {token ? (
                                        <>
                                          <TokenImage
                                            size="xs"
                                            className="mr-2"
                                            token={{
                                              ...token,
                                              balance_usd: 0,
                                              id: "",
                                              chain_id: token.chain_id,
                                            }}
                                          />
                                          {token?.symbol}
                                          &nbsp;
                                          <span className="text-text-weak">
                                            on{" "}
                                            {
                                              getChainWithChainId(
                                                token.chain_id,
                                              )?.name
                                            }
                                          </span>
                                          &nbsp;
                                          <ChainLogo chainId={token.chain_id} />
                                        </>
                                      ) : (
                                        "Select Token"
                                      )}
                                      <div className="grow" />
                                      {/* <ChevronDown className="size-4 opacity-50" /> */}
                                    </Button>
                                  </div>
                                </div>
                              </FormControl>
                            );
                          }}
                        />
                        <FormField
                          control={form.control}
                          name="isDirectSubmit"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  // disabled={!isUserOperationCreateSubmittable}
                                  onCheckedChange={field.onChange}
                                  onBlur={() => {
                                    form.trigger();
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="cursor-pointer">
                                  Confirm to directly execute the transaction
                                  upon signing.
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        {/* Show all errors for debugging */}
                        {/* <pre>{JSON.stringify(defaultValues, null, 2)}</pre> */}
                        {/* <pre>{JSON.stringify(form.formState.errors, null, 2)}</pre> */}
                      </form>
                    </Form>
                    {!isInsideModal && (
                      <FooterButton
                        cancelDisabled
                        isModal={false}
                        isLoading={isFormLoading}
                        disabled={isFormLoading || isFormDisabled}
                        customSuccessText={customFormSuccessText}
                        onClick={signUserOperations}
                      />
                    )}
                  </div>
                </TabsContent>
                <TabsContent
                  className={cn(isInsideModal && "h-72 overflow-y-auto")}
                  value="details"
                >
                  <div className="space-y-3 pt-3">
                    <TransactionDetails />
                  </div>
                </TabsContent>
                <TabsContent
                  className={cn(isInsideModal && "h-72 overflow-y-auto")}
                  value="data"
                >
                  <div className="space-y-3 pt-3">
                    <TransactionCalldata />
                  </div>
                </TabsContent>
                <TabsContent
                  className={cn(isInsideModal && "h-72 overflow-y-auto")}
                  value="dev"
                />
              </Tabs>
            </>
          )}
          {pageIndex === 1 && <Loading />}
          {pageIndex === 2 && <TransactionStatus />}
        </ModalSwiper>
      </div>
      {pageIndex === 0 &&
        userOperationsQueryState &&
        userOperationsQueryState.length > 0 &&
        userOperationsQueryState.map(userOperationQueryState => {
          return (
            <TransactionFetcher
              key={userOperationQueryState.hash}
              address={address}
              initialUserOperation={userOperationQueryState}
            />
          );
        })}
    </>
  );
};
