// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

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
} from "@lightdotso/query";
import type { UserOperation } from "@lightdotso/schemas";
import { useFormRef, useModalSwiper } from "@lightdotso/stores";
import {
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@lightdotso/ui";
import { cn } from "@lightdotso/utils";
import {
  useEstimateFeesPerGas,
  useEstimateGas,
  useEstimateMaxPriorityFeePerGas,
} from "@lightdotso/wagmi";
import { getUserOperationHash } from "permissionless";
import type { UserOperation as PermissionlessUserOperation } from "permissionless";
import { type FC, useMemo, useEffect, useState } from "react";
import { type Hex, type Address, fromHex } from "viem";
import { Loading } from "../loading";
import { useIsInsideModal } from "../modal";
import { ModalSwiper } from "../modal-swiper";
import { TransactionDevInfo } from "./transaction-dev-info";

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
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  // Turns the partial userOperation into an userOperation w/ default values
  const targetUserOperation: Omit<
    UserOperation,
    "hash" | "paymasterAndData" | "signature"
  > = useMemo(() => {
    const partialUserOperation =
      userOperations.length > 0
        ? userOperations[userOperationIndex]
        : { ...initialUserOperation };

    return {
      sender: partialUserOperation?.sender ?? address,
      chainId: partialUserOperation?.chainId ?? BigInt(0),
      initCode: partialUserOperation?.initCode ?? "0x",
      nonce: partialUserOperation?.nonce ?? BigInt(0),
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
  const { simulation } = useQuerySimulation({
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
        // Fallback to 1 if the maxPriorityFeePerGas is 0 from the RPC
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
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex w-full max-w-lg items-center">
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
              <TabsContent value="details">Details</TabsContent>
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
