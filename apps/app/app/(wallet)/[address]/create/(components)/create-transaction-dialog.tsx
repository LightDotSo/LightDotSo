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

import {
  useUserOperationsIndexQueryState,
  useUserOperationsQueryState,
} from "@lightdotso/nuqs";
import { useQueryConfiguration, useQueryWallet } from "@lightdotso/query";
import type { UserOperation } from "@lightdotso/schemas";
import { useAuth, useDev } from "@lightdotso/stores";
import { Transaction } from "@lightdotso/templates";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@lightdotso/ui";
import { useEffect, useMemo } from "react";
import type { FC } from "react";
import { isAddressEqual } from "viem";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type CreateTransactionDialogProps = {
  address: Address;
  userOperations: Omit<
    UserOperation,
    | "hash"
    | "signature"
    | "maxFeePerGas"
    | "maxPriorityFeePerGas"
    | "callGasLimit"
    | "preVerificationGas"
    | "verificationGasLimit"
  >[];
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const CreateTransactionDialog: FC<CreateTransactionDialogProps> = ({
  address,
  userOperations,
}) => {
  // ---------------------------------------------------------------------------
  // Query State Hooks
  // ---------------------------------------------------------------------------

  const [selectedOpIndex, setSelectedOpIndex] =
    useUserOperationsIndexQueryState();
  const [, setUserOperations] = useUserOperationsQueryState(userOperations);

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { address: userAddress } = useAuth();
  const { isDev } = useDev();

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!userOperations) {
      return;
    }

    setUserOperations(userOperations);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { configuration } = useQueryConfiguration({
    address: address,
  });

  const { wallet } = useQueryWallet({
    address: address,
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const owner = useMemo(() => {
    if (!userAddress || !configuration || !configuration.owners) {
      return;
    }

    return configuration.owners?.find(owner =>
      isAddressEqual(owner.address as Address, userAddress),
    );
  }, [configuration, userAddress]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!configuration || !wallet) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-col items-center justify-center">
      {userOperations && userOperations.length > 1 && (
        <Pagination>
          <PaginationContent>
            {userOperations &&
              userOperations.map((_, index) => (
                <PaginationItem
                  key={index}
                  onClick={() => setSelectedOpIndex(index)}
                >
                  <PaginationLink>{index + 1}</PaginationLink>
                </PaginationItem>
              ))}
          </PaginationContent>
        </Pagination>
      )}
      {userOperations && userOperations.length > 0 && (
        <Transaction
          key={selectedOpIndex}
          address={address}
          wallet={wallet}
          initialConfiguration={configuration}
          initialUserOperation={userOperations[selectedOpIndex]}
          userOperationIndex={selectedOpIndex}
          isDev={isDev}
        />
      )}
    </div>
  );
};
