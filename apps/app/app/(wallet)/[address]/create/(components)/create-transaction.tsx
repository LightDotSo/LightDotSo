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

import {
  useUserOperationsIndexQueryState,
  useUserOperationsQueryState,
} from "@lightdotso/nuqs";
import { useQueryConfiguration } from "@lightdotso/query";
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

type CreateTransactionProps = {
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

export const CreateTransaction: FC<CreateTransactionProps> = ({
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

  if (!configuration) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-col items-center justify-center">
      {userOperations && userOperations.length > 1 && (
        <Pagination>
          <PaginationContent>
            {userOperations.map((_, index) => (
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
          configuration={configuration}
          initialUserOperation={userOperations[selectedOpIndex]}
          userOperationIndex={selectedOpIndex}
          isDev={isDev}
        />
      )}
    </div>
  );
};
