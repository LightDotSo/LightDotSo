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
import { useUserOperationCreate } from "@lightdotso/hooks";
import { useQuerySimulation } from "@lightdotso/query";
import type { UserOperation } from "@lightdotso/schemas";
import { useModalSwiper, useDev } from "@lightdotso/stores";
import { Loading, ModalSwiper } from "@lightdotso/templates";
import { Button } from "@lightdotso/ui";
import { useEffect, type FC } from "react";
import type { Hex, Address } from "viem";
import { serializeBigInt } from "@/utils";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type OpCreateCardProps = {
  address: Address;
  config: ConfigurationData;
  userOperation: UserOperation;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const OpCreateCard: FC<OpCreateCardProps> = ({
  address,
  config,
  userOperation,
}) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { isDev } = useDev();
  const { pageIndex, setPageIndex } = useModalSwiper();

  // ---------------------------------------------------------------------------
  // App Hooks
  // ---------------------------------------------------------------------------

  const {
    isLoading,
    isCreatable,
    signUserOperation,
    decodedCallData,
    decodedInitCode,
    // paymasterHash,
    // paymasterNonce,
    subdigest,
  } = useUserOperationCreate({
    address: address,
    userOperation: userOperation,
    config: config,
  });

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { simulation } = useQuerySimulation({
    sender: address as Address,
    nonce: Number(userOperation.nonce),
    chain_id: Number(userOperation.chainId),
    call_data: userOperation.callData as Hex,
    init_code: userOperation.initCode as Hex,
  });

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (isLoading) {
      setPageIndex(1);
    } else {
      setPageIndex(0);
    }
  }, [isLoading, setPageIndex]);

  // ---------------------------------------------------------------------------
  // Dev Component
  // ---------------------------------------------------------------------------

  const Dev = () => {
    return (
      <div className="grid gap-4 py-4">
        <pre className="grid grid-cols-4 items-center gap-4 overflow-auto">
          <code>
            userOperation: {userOperation && serializeBigInt(userOperation)}
          </code>
        </pre>
        <pre className="grid grid-cols-4 items-center gap-4 overflow-auto">
          <code className="break-all text-text">
            chainId: {Number(userOperation.chainId)}
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
            userOpHash: {userOperation.hash}
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
          <code className="break-all text-text">subdigest: {subdigest}</code>
        </pre>
        <pre className="grid grid-cols-4 items-center gap-4 overflow-auto">
          <code className="break-all text-text">
            owners: {config.owners && JSON.stringify(config.owners, null, 2)}
          </code>
        </pre>
        <pre className="grid grid-cols-4 items-center gap-4 overflow-auto">
          <code className="break-all text-text">
            simulation: {simulation && JSON.stringify(simulation, null, 2)}
          </code>
        </pre>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex max-w-lg items-center">
      <ModalSwiper>
        {pageIndex === 0 && (
          <>
            {isDev && <Dev />}
            <div className="flex w-full flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <Button
                disabled={!isCreatable}
                isLoading={isLoading}
                onClick={signUserOperation}
              >
                Sign Transaction
              </Button>
            </div>
          </>
        )}
        {pageIndex === 1 && <Loading />}
      </ModalSwiper>
    </div>
  );
};
