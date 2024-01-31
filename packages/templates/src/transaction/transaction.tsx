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

// import { getPaymasterGasAndPaymasterAndData } from "@lightdotso/client";
import type { ConfigurationData } from "@lightdotso/data";
import { AssetChange } from "@lightdotso/elements";
import { useUserOperationCreate } from "@lightdotso/hooks";
import { useUserOperationsQueryState } from "@lightdotso/nuqs";
import { useQuerySimulation } from "@lightdotso/query";
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
import { useEstimateMaxPriorityFeePerGas } from "@lightdotso/wagmi";
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
    return userOperations.length > 0
      ? userOperations[userOperationIndex]
      : initialUserOperation;
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

  const maxPriorityFeePerGas = useEstimateMaxPriorityFeePerGas({
    chainId: Number(userOperation?.chainId ?? 1),
  });

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { simulation } = useQuerySimulation({
    sender: address as Address,
    nonce: Number(userOperation?.nonce ?? 0),
    chain_id: Number(userOperation?.chainId ?? 0),
    call_data: (userOperation?.callData ?? "0x") as Hex,
    init_code: (userOperation?.initCode ?? "0x") as Hex,
  });

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    setUserOperations(prev => {
      const next = [...prev];
      const updatedUserOperation = {
        ...userOperation,
        maxPriorityFeePerGas: maxPriorityFeePerGas.data,
      };
      next[userOperationIndex] = updatedUserOperation;
      return next;
    });
  }, [userOperation]);

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
                    <code className="break-all text-text">
                      chainId: {Number(userOperation?.chainId ?? 0)}
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
                  <pre className="grid grid-cols-4 items-center gap-4 overflow-auto">
                    <code className="break-all text-text">
                      userOpHash: {userOperation?.hash ?? "0x"}
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
