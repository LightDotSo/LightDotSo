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

import type { ConfigurationData } from "@lightdotso/data";
import { AssetChange } from "@lightdotso/elements";
import { useUserOperationCreate } from "@lightdotso/hooks";
import { useUserOperationsQueryState } from "@lightdotso/nuqs";
import {
  useQueryPaymasterGasAndPaymasterAndData,
  useQuerySimulation,
} from "@lightdotso/query";
import type { UserOperation } from "@lightdotso/schemas";
import { useModalSwiper } from "@lightdotso/stores";
import {
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@lightdotso/ui";
import { cn, serializeBigInt } from "@lightdotso/utils";
import {
  useEstimateGas,
  useEstimateFeesPerGas,
  useEstimateMaxPriorityFeePerGas,
} from "@lightdotso/wagmi";
import { type FC, useMemo, useEffect } from "react";
import type { Hex, Address } from "viem";
import { Loading } from "../loading";
import { useIsInsideModal } from "../modal";
import { ModalSwiper } from "../modal-swiper";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type TransactionProps = {
  address: Address;
  configuration: ConfigurationData;
  initialUserOperation: UserOperation;
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
  // Query State Hooks
  // ---------------------------------------------------------------------------

  const [userOperations, setUserOperations] = useUserOperationsQueryState();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const userOperation = useMemo(() => {
    const partialUserOperation =
      userOperations.length > 0
        ? userOperations[userOperationIndex]
        : initialUserOperation;

    // Fill in missing fields
    const userOperation: Omit<UserOperation, "hash"> = {
      ...partialUserOperation,
      chainId: partialUserOperation?.chainId ?? BigInt(0),
      sender: partialUserOperation?.sender ?? address,
      initCode: partialUserOperation?.initCode ?? "0x",
      nonce: partialUserOperation?.nonce ?? BigInt(0),
      callData: partialUserOperation?.callData ?? "0x",
      callGasLimit: partialUserOperation?.callGasLimit ?? BigInt(0),
      verificationGasLimit:
        partialUserOperation?.verificationGasLimit ?? BigInt(0),
      paymasterAndData: partialUserOperation?.paymasterAndData ?? "0x",
      preVerificationGas: partialUserOperation?.preVerificationGas ?? BigInt(0),
      maxFeePerGas: partialUserOperation?.maxFeePerGas ?? BigInt(0),
      maxPriorityFeePerGas:
        partialUserOperation?.maxPriorityFeePerGas ?? BigInt(0),
      signature: partialUserOperation?.signature ?? "0x",
    };

    return userOperation;
  }, [userOperations, userOperationIndex]);

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { pageIndex } = useModalSwiper();

  // ---------------------------------------------------------------------------
  // Local Hooks
  // ---------------------------------------------------------------------------

  const isInsideModal = useIsInsideModal();

  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  const { data: gas, error: estimateGasError } = useEstimateGas({
    data: (userOperation.callData as Hex) ?? "0x",
    chainId: Number(userOperation.chainId ?? 1),
  });

  const { data: feesPerGas, error: estimateFeesPerGasError } =
    useEstimateFeesPerGas({
      chainId: Number(userOperation.chainId ?? 1),
    });

  const {
    data: maxPriorityFeePerGas,
    error: estimateMaxPriorityFeePerGasError,
  } = useEstimateMaxPriorityFeePerGas({
    chainId: Number(userOperation.chainId ?? 1),
  });

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { paymasterAndData, paymasterAndDataError } =
    useQueryPaymasterGasAndPaymasterAndData({
      sender: address as Address,
      chainId: userOperation.chainId,
      nonce: userOperation.nonce,
      initCode: userOperation.initCode,
      callData: userOperation.callData,
      callGasLimit: userOperation.callGasLimit,
      verificationGasLimit: userOperation.verificationGasLimit,
      preVerificationGas: userOperation.preVerificationGas,
      maxFeePerGas: userOperation.maxFeePerGas,
      maxPriorityFeePerGas: userOperation.maxPriorityFeePerGas,
    });

  const { simulation } = useQuerySimulation({
    sender: address as Address,
    nonce: Number(userOperation.nonce),
    chain_id: Number(userOperation.chainId),
    call_data: userOperation.callData as Hex,
    init_code: userOperation.initCode as Hex,
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const updatedUserOperation = useMemo(() => {
    const updatedUserOperation = {
      ...userOperation,
      callGasLimit: gas ?? BigInt(0),
      maxFeePerGas: feesPerGas?.maxFeePerGas ?? BigInt(0),
      maxPriorityFeePerGas: maxPriorityFeePerGas ?? BigInt(0),
      paymasterAndData: paymasterAndData?.paymasterAndData ?? "0x",
    };
    return updatedUserOperation;
  }, [
    userOperation,
    gas,
    feesPerGas?.maxFeePerGas,
    maxPriorityFeePerGas,
    paymasterAndData?.paymasterAndData,
  ]);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // useEffect(() => {
  //   setUserOperations(prev => {
  //     const next = [...prev];
  //     const updatedUserOperation = {
  //       ...userOperation,
  //       callGasLimit: gas ?? BigInt(0),
  //       maxFeePerGas: feesPerGas?.maxFeePerGas ?? BigInt(0),
  //       maxPriorityFeePerGas: maxPriorityFeePerGas ?? BigInt(0),
  //       paymasterAndData: paymasterAndData?.paymasterAndData ?? "0x",
  //     };
  //     next[userOperationIndex] = updatedUserOperation;
  //     return next;
  //   });
  // }, [userOperation]);

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const {
    isLoading,
    isCreatable,
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
    userOperation: userOperation,
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex w-full max-w-lg items-center">
      <ModalSwiper>
        {pageIndex === 0 && (
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
                      disabled={!isCreatable || !isValidUserOperation}
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
                  <pre className="grid grid-cols-4 items-center gap-4 overflow-auto">
                    <code>
                      userOperation:{" "}
                      {userOperation && serializeBigInt(userOperation)}
                    </code>
                  </pre>
                  <pre className="grid grid-cols-4 items-center gap-4 overflow-auto">
                    <code>
                      updatedUserOperation:{" "}
                      {updatedUserOperation &&
                        serializeBigInt(updatedUserOperation)}
                    </code>
                  </pre>
                  <pre className="grid grid-cols-4 items-center gap-4 overflow-auto">
                    <code>
                      estimateGasError:{" "}
                      {estimateGasError && estimateGasError.message}
                      <br />
                      estimateFeesPerGasError:{" "}
                      {estimateFeesPerGasError &&
                        estimateFeesPerGasError.message}
                      <br />
                      estimateMaxPriorityFeePerGasError:{" "}
                      {estimateMaxPriorityFeePerGasError &&
                        estimateMaxPriorityFeePerGasError.message}
                      <br />
                      paymasterAndDataError:{" "}
                      {paymasterAndDataError && paymasterAndDataError.message}
                    </code>
                  </pre>
                  <pre className="grid grid-cols-4 items-center gap-4 overflow-auto">
                    <code className="break-all text-text">
                      chainId: {Number(userOperation.chainId ?? 0)}
                    </code>
                  </pre>
                  <pre className="grid grid-cols-4 items-center gap-4 overflow-auto">
                    <code className="break-all text-text">
                      decodedInitCode:{" "}
                      {decodedInitCode && serializeBigInt(decodedInitCode)}
                    </code>
                  </pre>
                  <pre className="grid grid-cols-4 items-center gap-4 overflow-auto">
                    <code className="break-all text-text">
                      decodedCallData:{" "}
                      {decodedCallData && serializeBigInt(decodedCallData)}
                    </code>
                  </pre>
                  {/* <pre className="grid grid-cols-4 items-center gap-4 overflow-auto">
                    <code className="break-all text-text">
                      paymasterNonce: {serializeBigInt(paymasterNonce)}
                    </code>
                  </pre> */}
                  {/* <pre className="grid grid-cols-4 items-center gap-4 overflow-auto">
                    <code className="break-all text-text">
                      paymasterHash: {paymasterHash}
                    </code>
                  </pre> */}
                  <pre className="grid grid-cols-4 items-center gap-4 overflow-auto">
                    <code className="break-all text-text">
                      subdigest: {subdigest}
                    </code>
                  </pre>
                  <pre className="grid grid-cols-4 items-center gap-4 overflow-auto">
                    <code className="break-all text-text">
                      owners:{" "}
                      {configuration.owners &&
                        JSON.stringify(configuration.owners, null, 2)}
                    </code>
                  </pre>
                  <pre className="grid grid-cols-4 items-center gap-4 overflow-auto">
                    <code className="break-all text-text">
                      simulation:{" "}
                      {simulation && JSON.stringify(simulation, null, 2)}
                    </code>
                  </pre>
                  <pre className="grid grid-cols-4 items-center gap-4 overflow-auto">
                    <code className="break-all text-text">
                      owner: {JSON.stringify(owner)}
                    </code>
                  </pre>
                  <pre className="grid grid-cols-4 items-center gap-4 overflow-auto">
                    <code className="break-all text-text">
                      isCreatable: {isCreatable ? "true" : "false"}
                      <br />
                      isLoading: {isLoading ? "true" : "false"}
                      <br />
                      isValidUserOperation:{" "}
                      {isValidUserOperation ? "true" : "false"}
                    </code>
                  </pre>
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
