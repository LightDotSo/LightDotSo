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

import { CONTRACT_ADDRESSES } from "@lightdotso/const";
import type { ConfigurationData } from "@lightdotso/data";
import { AssetChange } from "@lightdotso/elements";
import { useUserOperationCreate } from "@lightdotso/hooks";
import { useUserOperationsQueryState } from "@lightdotso/nuqs";
import {
  useQueryEstimateUserOperationGas,
  useQueryPaymasterGasAndPaymasterAndData,
  useQuerySimulation,
  useQueryUserOperationNonce,
} from "@lightdotso/query";
import { userOperation, type UserOperation } from "@lightdotso/schemas";
import { useFormRef, useModalSwiper } from "@lightdotso/stores";
import {
  Button,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@lightdotso/ui";
import {
  cn,
  getChainById,
  shortenAddress,
  shortenBytes32,
} from "@lightdotso/utils";
import {
  useEstimateFeesPerGas,
  useEstimateGas,
  useEstimateMaxPriorityFeePerGas,
} from "@lightdotso/wagmi";
import { zodResolver } from "@hookform/resolvers/zod";
import { getUserOperationHash } from "permissionless";
import type { UserOperation as PermissionlessUserOperation } from "permissionless";
import { type FC, useMemo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { type Hex, type Address, fromHex } from "viem";
import { Loading } from "../loading";
import { useIsInsideModal } from "../modal";
import { ModalSwiper } from "../modal-swiper";
import { TransactionDetailInfo } from "./transaction-details-info";
import { TransactionDevInfo } from "./transaction-dev-info";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface TransactionDetailsItem {
  title: string;
  value: string | number;
  href?: string;
}

// -----------------------------------------------------------------------------
// Schema
// -----------------------------------------------------------------------------

const userOperationFormSchema = userOperation;

type UserOperationFormValues = UserOperation;

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type TransactionProps = {
  address: Address;
  configuration: ConfigurationData;
  initialUserOperation: Omit<
    UserOperation,
    | "hash"
    | "signature"
    | "paymasterAndData"
    | "maxFeePerGas"
    | "maxPriorityFeePerGas"
    | "callGasLimit"
    | "preVerificationGas"
    | "verificationGasLimit"
  >;
  userOperationIndex: number;
  isDev?: boolean;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Transaction: FC<TransactionProps> = ({
  address,
  configuration,
  initialUserOperation,
  userOperationIndex = 0,
  isDev = false,
}) => {
  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [userOperationWithHash, setUserOperationWithHash] =
    useState<UserOperation>();

  // ---------------------------------------------------------------------------
  // Query State Hooks
  // ---------------------------------------------------------------------------

  const [userOperations, setUserOperations] = useUserOperationsQueryState();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { setIsFormDisabled, setIsFormLoading } = useFormRef();
  const { pageIndex } = useModalSwiper();

  // ---------------------------------------------------------------------------
  // Local Hooks
  // ---------------------------------------------------------------------------

  const isInsideModal = useIsInsideModal();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { userOperationNonce, isUserOperationNonceLoading } =
    useQueryUserOperationNonce({
      address: address,
      chain_id: Number(initialUserOperation.chainId),
    });

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  const form = useForm<UserOperationFormValues>({
    mode: "all",
    reValidateMode: "onBlur",
    resolver: zodResolver(userOperationFormSchema),
    defaultValues: initialUserOperation,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formValues = form.watch();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  // Turns the partial userOperation into an userOperation w/ default values
  const targetUserOperation: Omit<
    UserOperation,
    "hash" | "paymasterAndData" | "signature"
  > = useMemo(() => {
    const partialUserOperation =
      userOperations.length > 0
        ? { ...userOperations[userOperationIndex], ...initialUserOperation }
        : { ...initialUserOperation };

    const updatedMinimumNonce = userOperationNonce
      ? userOperationNonce?.nonce > partialUserOperation.nonce
        ? BigInt(userOperationNonce?.nonce)
        : partialUserOperation.nonce
      : partialUserOperation.nonce;

    return {
      sender: partialUserOperation?.sender ?? address,
      chainId: partialUserOperation?.chainId ?? BigInt(0),
      initCode: partialUserOperation?.initCode ?? "0x",
      nonce: updatedMinimumNonce ?? BigInt(0),
      callData: partialUserOperation?.callData ?? "0x",
      callGasLimit: partialUserOperation?.callGasLimit ?? BigInt(0),
      verificationGasLimit:
        partialUserOperation?.verificationGasLimit ?? BigInt(0),
      preVerificationGas: partialUserOperation?.preVerificationGas ?? BigInt(0),
      maxFeePerGas: partialUserOperation?.maxFeePerGas ?? BigInt(0),
      maxPriorityFeePerGas:
        partialUserOperation?.maxPriorityFeePerGas ?? BigInt(0),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userOperations]);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  // Gets the simulation for the user operation
  const { simulation, isSimulationLoading } = useQuerySimulation({
    sender: address as Address,
    nonce: Number(targetUserOperation.nonce),
    chain_id: Number(targetUserOperation.chainId),
    call_data: targetUserOperation.callData as Hex,
    init_code: targetUserOperation.initCode as Hex,
  });

  // Gets the gas estimate for the user operation
  const {
    estimateUserOperationGasData,
    isEstimateUserOperationGasDataLoading,
    estimateUserOperationGasDataError,
  } = useQueryEstimateUserOperationGas({
    sender: address as Address,
    chainId: targetUserOperation.chainId,
    nonce: targetUserOperation.nonce,
    initCode: targetUserOperation.initCode,
    callData: targetUserOperation.callData,
  });

  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  // Get the gas estimate for the user operation
  const { data: estimateGas, error: estimateGasError } = useEstimateGas({
    chainId: Number(targetUserOperation.chainId ?? 1),
    account: address as Address,
    data: targetUserOperation.callData as Hex,
    to: CONTRACT_ADDRESSES["Entrypoint"],
  });

  // Get the max fee per gas, fallbacks to mainnet
  const { data: feesPerGas, error: estimateFeesPerGasError } =
    useEstimateFeesPerGas({
      chainId: Number(targetUserOperation.chainId ?? 1),
    });

  // Get the max priority fee per gas, fallbacks to mainnet
  const {
    data: maxPriorityFeePerGas,
    error: estimateMaxPriorityFeePerGasError,
  } = useEstimateMaxPriorityFeePerGas({
    chainId: Number(targetUserOperation.chainId ?? 1),
  });

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { paymasterAndData, isPaymasterAndDataLoading, paymasterAndDataError } =
    useQueryPaymasterGasAndPaymasterAndData({
      sender: address as Address,
      chainId: targetUserOperation.chainId,
      nonce: targetUserOperation.nonce,
      initCode: targetUserOperation.initCode,
      callData: targetUserOperation.callData,
      callGasLimit: estimateUserOperationGasData?.callGasLimit
        ? fromHex(estimateUserOperationGasData?.callGasLimit as Hex, {
            to: "bigint",
          })
        : BigInt(0),
      preVerificationGas: estimateUserOperationGasData?.preVerificationGas
        ? fromHex(estimateUserOperationGasData?.preVerificationGas as Hex, {
            to: "bigint",
          })
        : BigInt(0),
      verificationGasLimit: estimateUserOperationGasData?.verificationGasLimit
        ? fromHex(estimateUserOperationGasData?.verificationGasLimit as Hex, {
            to: "bigint",
          })
        : BigInt(0),
      maxFeePerGas:
        feesPerGas?.maxFeePerGas ?? targetUserOperation.maxFeePerGas,
      maxPriorityFeePerGas:
        // If the chain is Celo, `maxFeePerGas` is the same as `maxPriorityFeePerGas`
        targetUserOperation.chainId === BigInt(42220)
          ? feesPerGas?.maxFeePerGas ?? targetUserOperation.maxFeePerGas
          : // Fallback to 1 if the maxPriorityFeePerGas is 0 from the RPC
            maxPriorityFeePerGas === BigInt(0)
            ? BigInt(1)
            : maxPriorityFeePerGas ?? targetUserOperation.maxPriorityFeePerGas,
    });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const updatedUserOperation: Omit<UserOperation, "hash" | "signature"> =
    useMemo(() => {
      return {
        // The default values
        sender: targetUserOperation.sender,
        chainId: targetUserOperation.chainId,
        initCode: targetUserOperation.initCode,
        nonce: targetUserOperation.nonce,
        callData: targetUserOperation.callData,
        // The target values to fill in
        maxFeePerGas: paymasterAndData?.maxFeePerGas
          ? fromHex(paymasterAndData.maxFeePerGas as Hex, { to: "bigint" })
          : BigInt(0),
        maxPriorityFeePerGas: paymasterAndData?.maxPriorityFeePerGas
          ? fromHex(paymasterAndData.maxPriorityFeePerGas as Hex, {
              to: "bigint",
            })
          : BigInt(0),
        callGasLimit: paymasterAndData?.callGasLimit
          ? fromHex(paymasterAndData.callGasLimit as Hex, { to: "bigint" })
          : BigInt(0),
        verificationGasLimit: paymasterAndData?.verificationGasLimit
          ? fromHex(paymasterAndData.verificationGasLimit as Hex, {
              to: "bigint",
            })
          : BigInt(0),
        preVerificationGas: paymasterAndData?.preVerificationGas
          ? fromHex(paymasterAndData.preVerificationGas as Hex, {
              to: "bigint",
            })
          : BigInt(0),
        // The core paymaster and data values
        paymasterAndData: paymasterAndData?.paymasterAndData ?? "0x",
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetUserOperation, paymasterAndData]);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const fetchHashAndUpdateOperation = async () => {
      // Check if all the fields are filled in
      if (
        updatedUserOperation.callGasLimit === 0n ||
        updatedUserOperation.verificationGasLimit === 0n ||
        updatedUserOperation.preVerificationGas === 0n ||
        updatedUserOperation.maxFeePerGas === 0n ||
        updatedUserOperation.maxPriorityFeePerGas === 0n ||
        updatedUserOperation.paymasterAndData === "0x"
      ) {
        return;
      }

      // IF the fields differ, update the user operation
      if (
        targetUserOperation.callGasLimit !==
          updatedUserOperation.callGasLimit ||
        targetUserOperation.verificationGasLimit !==
          updatedUserOperation.verificationGasLimit ||
        targetUserOperation.preVerificationGas !==
          updatedUserOperation.preVerificationGas ||
        targetUserOperation.maxFeePerGas !==
          updatedUserOperation.maxFeePerGas ||
        targetUserOperation.maxPriorityFeePerGas !==
          updatedUserOperation.maxPriorityFeePerGas
      ) {
        setUserOperations(prev => {
          const next = [...prev];
          next[userOperationIndex] = updatedUserOperation;
          return next;
        });
      }

      // Add the dummy signature to get the hash
      const userOperation = {
        ...updatedUserOperation,
        signature: "0x",
      };

      const hash = await getUserOperationHash({
        userOperation: userOperation as PermissionlessUserOperation,
        entryPoint: CONTRACT_ADDRESSES["Entrypoint"],
        chainId: Number(updatedUserOperation.chainId) as number,
      });

      setUserOperationWithHash({
        ...userOperation,
        hash,
      });
    };

    fetchHashAndUpdateOperation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatedUserOperation, address]);

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const {
    isUserOperationLoading,
    isUserOperationCreatable,
    isValidUserOperation,
    signUserOperation,
    decodedCallData,
    decodedInitCode,
    // paymasterHash,
    // paymasterNonce,
    owner,
    subdigest,
  } = useUserOperationCreate({
    address: address,
    configuration: configuration,
    userOperation: userOperationWithHash,
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isLoading = useMemo(() => {
    return (
      isEstimateUserOperationGasDataLoading ||
      isUserOperationLoading ||
      isPaymasterAndDataLoading
    );
  }, [
    isEstimateUserOperationGasDataLoading,
    isUserOperationLoading,
    isPaymasterAndDataLoading,
  ]);

  const isUpdating = useMemo(() => {
    return isPaymasterAndDataLoading;
  }, [isPaymasterAndDataLoading]);

  const isDisabled = useMemo(() => {
    return !isUserOperationCreatable || !isValidUserOperation || isLoading;
  }, [isUserOperationCreatable, isValidUserOperation, isLoading]);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    setIsFormDisabled(isDisabled);
  }, [isDisabled, setIsFormDisabled]);

  useEffect(() => {
    setIsFormLoading(isLoading);
  }, [isLoading, setIsFormLoading]);

  useEffect(() => {
    setUserOperations(prev => {
      // Set the userOperationWithHash at the userOperationIndex
      const next = [...prev];
      if (!userOperationWithHash) {
        return next;
      }
      next[userOperationIndex] = userOperationWithHash;
      return next;
    });
  }, [userOperationWithHash, userOperationIndex, setUserOperations]);

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const chain = useMemo(
    () => getChainById(Number(targetUserOperation.chainId)),
    [targetUserOperation.chainId],
  );

  const informationItems = useMemo(() => {
    const items: TransactionDetailsItem[] = [
      { title: "Nonce", value: Number(targetUserOperation.nonce) },
      { title: "Sender", value: shortenAddress(targetUserOperation.sender) },
      { title: "Threshold", value: configuration?.threshold },
      { title: "Chain", value: chain?.name },
    ];

    if (estimateUserOperationGasData?.callGasLimit) {
      items.push({
        title: "Call Gas Limit",
        value: fromHex(estimateUserOperationGasData.callGasLimit as Hex, {
          to: "bigint",
        }).toLocaleString(),
      });
    }

    if (estimateUserOperationGasData?.preVerificationGas) {
      items.push({
        title: "Pre-Verification Gas",
        value: fromHex(estimateUserOperationGasData.preVerificationGas as Hex, {
          to: "bigint",
        }).toLocaleString(),
      });
    }

    if (estimateUserOperationGasData?.verificationGasLimit) {
      items.push({
        title: "Verification Gas Limit",
        value: fromHex(
          estimateUserOperationGasData.verificationGasLimit as Hex,
          { to: "bigint" },
        ).toLocaleString(),
      });
    }

    if (feesPerGas?.maxFeePerGas) {
      items.push({
        title: "Max Fee Per Gas",
        value: feesPerGas.maxFeePerGas.toLocaleString(),
      });
    }

    if (maxPriorityFeePerGas) {
      items.push({
        title: "Max Priority Fee Per Gas",
        value: maxPriorityFeePerGas.toLocaleString(),
      });
    }

    if (userOperationWithHash?.hash) {
      items.push({
        title: "Hash",
        value: shortenBytes32(userOperationWithHash.hash),
      });
    }

    return items;
  }, [
    chain,
    configuration?.threshold,
    targetUserOperation.nonce,
    targetUserOperation.sender,
    userOperationWithHash?.hash,
    estimateUserOperationGasData?.callGasLimit,
    estimateUserOperationGasData?.preVerificationGas,
    estimateUserOperationGasData?.verificationGasLimit,
    feesPerGas?.maxFeePerGas,
    maxPriorityFeePerGas,
  ]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
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
                <div className="flex flex-col space-y-4">
                  {isSimulationLoading && <Skeleton className="h-32" />}
                  {simulation &&
                    simulation.interpretation.asset_changes.map(
                      (asset_change, _index) => {
                        return (
                          <div key={asset_change.id} className="flex">
                            <AssetChange assetChange={asset_change} />
                          </div>
                        );
                      },
                    )}
                </div>
                {!isInsideModal && (
                  <div className="flex w-full flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                    <Button
                      disabled={isDisabled}
                      isLoading={isLoading}
                      onClick={signUserOperation}
                    >
                      Sign Transaction
                    </Button>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="details">
                {informationItems.map(item => (
                  <TransactionDetailInfo
                    key={item.title}
                    title={item.title}
                    value={item.value}
                  />
                ))}
              </TabsContent>
              <TabsContent value="data">
                <div className="w-full rounded-md bg-background-weak py-3">
                  <pre className="text-sm italic">
                    <Textarea
                      readOnly
                      className="h-96 w-full"
                      value={userOperationWithHash?.callData}
                    />
                  </pre>
                </div>
              </TabsContent>
              <TabsContent value="dev">
                <div className="grid gap-4 py-4">
                  <TransactionDevInfo
                    title="targetUserOperation"
                    data={targetUserOperation}
                  />
                  <TransactionDevInfo
                    title="updatedUserOperation"
                    data={updatedUserOperation}
                  />
                  <TransactionDevInfo
                    title="userOperationWithHash"
                    data={userOperationWithHash}
                  />
                  <TransactionDevInfo
                    title="estimateUserOperationGasData"
                    data={estimateUserOperationGasData}
                  />
                  <TransactionDevInfo title="feesPerGas" data={feesPerGas} />
                  <TransactionDevInfo
                    isNumber
                    title="estimateGas"
                    data={estimateGas}
                  />
                  <TransactionDevInfo
                    isNumber
                    title="maxPriorityFeePerGas"
                    data={maxPriorityFeePerGas}
                  />
                  <TransactionDevInfo
                    title="estimateGasError"
                    data={estimateGasError}
                  />
                  <TransactionDevInfo
                    title="estimateFeesPerGasError"
                    data={estimateFeesPerGasError}
                  />
                  <TransactionDevInfo
                    title="estimateMaxPriorityFeePerGasError"
                    data={estimateMaxPriorityFeePerGasError}
                  />
                  <TransactionDevInfo
                    title="estimateUserOperationGasDataError"
                    data={estimateUserOperationGasDataError}
                  />
                  <TransactionDevInfo
                    title="paymasterAndDataError"
                    data={paymasterAndDataError}
                  />
                  <TransactionDevInfo
                    title="decodedInitCode"
                    data={decodedInitCode}
                  />
                  <TransactionDevInfo
                    title="decodedCallData"
                    data={decodedCallData}
                  />
                  <TransactionDevInfo title="subdigest" data={subdigest} />
                  <TransactionDevInfo
                    title="paymasterAndData"
                    data={paymasterAndData}
                  />
                  <TransactionDevInfo title="simulation" data={simulation} />
                  <TransactionDevInfo
                    title="owners"
                    data={configuration.owners}
                  />
                  <TransactionDevInfo title="owner" data={owner} />
                  <TransactionDevInfo
                    title="isUserOperationCreatable"
                    data={isUserOperationCreatable}
                  />
                  <TransactionDevInfo
                    title="isEstimateUserOperationGasDataLoading"
                    data={isEstimateUserOperationGasDataLoading}
                  />
                  <TransactionDevInfo
                    title="isUserOperationLoading"
                    data={isUserOperationLoading}
                  />
                  <TransactionDevInfo
                    title="isPaymasterAndDataLoading"
                    data={isPaymasterAndDataLoading}
                  />
                  <TransactionDevInfo title="isLoading" data={isLoading} />
                  <TransactionDevInfo title="isUpdating" data={isUpdating} />
                  <TransactionDevInfo
                    title="isValidUserOperation"
                    data={isValidUserOperation}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
        {pageIndex === 1 && <Loading />}
      </ModalSwiper>
    </div>
  );
};
