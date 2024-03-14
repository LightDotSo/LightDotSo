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
import { type UserOperation } from "@lightdotso/schemas";
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
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@lightdotso/ui";
import { cn, getChainById } from "@lightdotso/utils";
import { usePathname } from "next/navigation";
import { useEffect, type FC } from "react";
import { type Address } from "viem";
import { Loading } from "../loading";
import { useIsInsideModal } from "../modal";
import { ModalSwiper } from "../modal-swiper";
import { TransactionDetailInfo } from "./transaction-details-info";
import { TransactionDevInfo } from "./transaction-dev-info";
import { TransactionFetcher } from "./transaction-fetcher";

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

  const { pageIndex } = useModalSwiper();
  const {
    userOperationDetails,
    userOperationDevInfo,
    userOperationSimulations,
    resetAll,
  } = useUserOperations();
  const { isFormDisabled, isFormLoading, setIsFormDisabled } = useFormRef();

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
    signUserOperation,
    // decodedCallData,
    // decodedInitCode,
    // paymasterHash,
    // paymasterNonce,
    // owner,
    // subdigest,
  } = useUserOperationCreate({
    address: address,
    // configuration: configuration,
    // userOperation: userOperationWithHash,
  });

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // On pathname change, reset all user operations
  useEffect(() => {
    resetAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, resetAll]);

  // If all of the items in the userOperations array have a hash, set form disabled to false
  useEffect(() => {
    if (userOperations) {
      const isValid = userOperations.every(userOperation => userOperation.hash);
      setIsFormDisabled(!isValid);
    }
  }, [userOperations, setIsFormDisabled]);

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
                  {!isInsideModal && (
                    <div className="flex w-full flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                      <Button
                        disabled={isFormDisabled || isFormLoading}
                        isLoading={isFormLoading}
                        onClick={signUserOperation}
                      >
                        Sign Transaction
                      </Button>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="details">
                  <div className="py-3">
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
                  <div className="py-3">
                    {userOperations &&
                      userOperations.length > 0 &&
                      userOperations.map((userOperation, index) => {
                        return (
                          <Accordion
                            key={index}
                            collapsible
                            defaultValue="value-0"
                            className="rounded-md bg-background-weak py-3"
                            type="single"
                          >
                            <AccordionItem
                              className="border-0"
                              value={`value-${index}`}
                            >
                              <AccordionTrigger className="px-1 py-0 text-xl font-medium md:text-2xl">
                                User Operation #{index + 1}
                              </AccordionTrigger>
                              <AccordionContent className="px-1 pt-4">
                                <pre className="text-sm italic">
                                  <Textarea
                                    readOnly
                                    className="w-full"
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
                  <div className="py-3">
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
