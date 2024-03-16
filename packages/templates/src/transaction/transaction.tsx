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

import type { ConfigurationData, WalletData } from "@lightdotso/data";
import { AssetChange } from "@lightdotso/elements";
import { useUserOperationCreate } from "@lightdotso/hooks";
import { useUserOperationsQueryState } from "@lightdotso/nuqs";
import { type UserOperation, transactionFormSchema } from "@lightdotso/schemas";
import {
  useFormRef,
  useModalSwiper,
  useUserOperations,
} from "@lightdotso/stores";
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Form,
  FormItem,
  FormField,
  FormControl,
  Checkbox,
  FormLabel,
} from "@lightdotso/ui";
import { cn, getChainById } from "@lightdotso/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname } from "next/navigation";
import { use, useEffect, useMemo, type FC } from "react";
import { useForm } from "react-hook-form";
import type { Hex, Address } from "viem";
import type * as z from "zod";
import { FooterButton } from "../footer-button";
import { Loading } from "../loading";
import { useIsInsideModal } from "../modal";
import { ModalSwiper } from "../modal-swiper";
import { TransactionDetailInfo } from "./transaction-details-info";
import { TransactionDevInfo } from "./transaction-dev-info";
import { TransactionFetcher } from "./transaction-fetcher";
import { TransactionSender } from "./transaction-sender";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type TransactionProps = {
  address: Address;
  wallet: WalletData;
  genesisConfiguration: ConfigurationData;
  initialUserOperations: Array<
    Omit<
      UserOperation,
      | "hash"
      | "signature"
      | "paymasterAndData"
      | "maxFeePerGas"
      | "maxPriorityFeePerGas"
      | "callGasLimit"
      | "preVerificationGas"
      | "verificationGasLimit"
    >
  >;
  isDev?: boolean;
};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Transaction: FC<TransactionProps> = ({
  address,
  wallet,
  genesisConfiguration,
  initialUserOperations,
  isDev = false,
}) => {
  // ---------------------------------------------------------------------------
  // Next Hooks
  // ---------------------------------------------------------------------------

  const pathname = usePathname();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { pageIndex, setPageIndex } = useModalSwiper();
  const {
    userOperationDetails,
    userOperationDevInfo,
    userOperationSimulations,
    setPendingSubmitUserOperationHashes,
    resetAll,
  } = useUserOperations();
  const {
    customFormSuccessText,
    isFormLoading,
    setIsFormLoading,
    isFormDisabled,
    setIsFormDisabled,
  } = useFormRef();

  // ---------------------------------------------------------------------------
  // Query State Hooks
  // ---------------------------------------------------------------------------

  const [userOperations] = useUserOperationsQueryState();

  // ---------------------------------------------------------------------------
  // Local Hooks
  // ---------------------------------------------------------------------------

  const isInsideModal = useIsInsideModal();

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const {
    // isUserOperationLoading,
    // isUserOperationCreatable,
    // isValidUserOperation,
    isUserOperationCreateLoading,
    isUserOperationCreateSuccess,
    isUserOperationCreateSubmittable,
    signUserOperation,
    // decodedCallData,
    // decodedInitCode,
    // paymasterHash,
    // paymasterNonce,
    // owner,
    // subdigest,
  } = useUserOperationCreate({
    address: address,
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const defaultValues: TransactionFormValues = useMemo(() => {
    return {
      isDirectSubmit: isUserOperationCreateSubmittable,
    };
  }, [isUserOperationCreateSubmittable]);

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
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isTransactionLoading = useMemo(() => {
    return isUserOperationCreateLoading;
  }, [isUserOperationCreateLoading]);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // Set the pending submit userOperation hashes
  useEffect(() => {
    if (!isUserOperationCreateSuccess) {
      return;
    }

    const hashes = userOperations.map(
      userOperation => userOperation.hash as Hex,
    );

    setPendingSubmitUserOperationHashes(hashes);
  }, [
    userOperations,
    isUserOperationCreateSuccess,
    setPendingSubmitUserOperationHashes,
  ]);

  // Change the page index depending on the sign loading state
  useEffect(() => {
    if (isUserOperationCreateLoading) {
      setPageIndex(1);
    } else {
      setPageIndex(0);
    }
  }, [isUserOperationCreateLoading, setPageIndex]);

  // Change the page index depending on the sign success state
  useEffect(() => {
    if (isUserOperationCreateSuccess && watchIsDirectSubmit) {
      setPageIndex(2);
    }
  }, [isUserOperationCreateSuccess, watchIsDirectSubmit, setPageIndex]);

  // On pathname change, reset all user operations
  useEffect(() => {
    resetAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, resetAll]);

  // If the transaction is loading, set the form loading to true
  useEffect(() => {
    if (isTransactionLoading) {
      setIsFormLoading(true);
    } else {
      setIsFormLoading(false);
    }
  }, [isTransactionLoading]);

  // If all of the items in the userOperations array have a hash, set form disabled to false
  useEffect(() => {
    if (userOperations) {
      const isValid = userOperations.every(userOperation => userOperation.hash);
      setIsFormDisabled(!isValid);
    }
  }, [userOperations, setIsFormDisabled]);

  // Sync the `isDirectSubmit` field with the `isUserOperationCreateSubmittable` value
  useEffect(() => {
    form.setValue("isDirectSubmit", isUserOperationCreateSubmittable);
  }, [form, isUserOperationCreateSubmittable]);

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
                <TabsList className="w-full">
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
                <TabsContent value="transaction">
                  <div className="pt-3 space-y-3">
                    {Object.values(userOperationSimulations).map(simulation => {
                      return simulation.interpretation.asset_changes.map(
                        (assetChange, index) => {
                          return (
                            <AssetChange
                              key={`${assetChange.id}-${index}`}
                              assetChange={assetChange}
                            />
                          );
                        },
                      );
                    })}
                    <Form {...form}>
                      <form className="space-y-4">
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
                        form="transaction-modal-form"
                        isModal={false}
                        cancelDisabled={true}
                        isLoading={isFormLoading}
                        disabled={
                          isFormLoading || isFormDisabled
                          // !isFormValid || isFormLoading || delayedIsSuccess
                        }
                        customSuccessText={customFormSuccessText}
                        onClick={signUserOperation}
                      />
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="details">
                  <div className="pt-3 space-y-3">
                    {Object.entries(userOperationDetails).map(
                      ([chainId, details], index) => {
                        const chain = getChainById(Number(chainId));
                        return (
                          <Accordion
                            key={index}
                            collapsible
                            defaultValue="value-0"
                            className="rounded-md border border-border bg-background-weak p-4"
                            type="single"
                          >
                            <AccordionItem
                              className="border-0"
                              value={`value-${index}`}
                            >
                              <AccordionTrigger className="px-1 py-0 text-xl font-medium md:text-2xl">
                                Transaction on {chain.name}
                              </AccordionTrigger>
                              <AccordionContent className="px-1 pt-4">
                                {details.map((item, itemIndex) => (
                                  <TransactionDetailInfo
                                    key={`${index}-${itemIndex}`}
                                    title={item.title}
                                    value={item.value}
                                  />
                                ))}
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        );
                      },
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="data">
                  <div className="pt-3 space-y-3">
                    {userOperations &&
                      userOperations.length > 0 &&
                      userOperations.map((userOperation, index) => {
                        return (
                          <Accordion
                            key={index}
                            collapsible
                            defaultValue="value-0"
                            className="rounded-md border border-border bg-background-weak p-4"
                            type="single"
                          >
                            <AccordionItem
                              className="border-0"
                              value={`value-${index}`}
                            >
                              <AccordionTrigger className="px-1 py-0 text-xl font-medium md:text-2xl">
                                Calldata #{index + 1}
                              </AccordionTrigger>
                              <AccordionContent className="px-1 pt-4">
                                <pre className="text-sm italic">
                                  <Textarea
                                    readOnly
                                    className="h-auto w-full"
                                    value={userOperation.callData}
                                  />
                                </pre>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        );
                      })}
                  </div>
                </TabsContent>
                <TabsContent value="dev">
                  <div className="pt-3">
                    {Object.values(userOperationDevInfo).map((info, index) => {
                      return info.map((item, itemIndex) => {
                        return (
                          <TransactionDevInfo
                            key={`${index}-${itemIndex}`}
                            data={item.data}
                            title={item.title}
                            isNumber={item.isNumber}
                          />
                        );
                      });
                    })}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
          {pageIndex === 1 && <Loading />}
          {pageIndex === 2 && <TransactionSender address={address} />}
        </ModalSwiper>
      </div>
      {initialUserOperations &&
        initialUserOperations.length > 0 &&
        initialUserOperations.map((userOperation, index) => {
          return (
            <TransactionFetcher
              key={index}
              address={address}
              wallet={wallet}
              genesisConfiguration={genesisConfiguration}
              initialUserOperation={userOperation}
              userOperationIndex={index}
            />
          );
        })}
    </>
  );
};
