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

import { useMemo } from "react";
import type { FC } from "react";
import { isAddressEqual } from "viem";
import type { Address } from "viem";
import { OpConfirmCard } from "@/app/(wallet)/[address]/op/(components)/op-create-card";
import { useAuth } from "@/stores/useAuth";
import type { UserOperation } from "@/types";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type OpCreateDialogProps = {
  address: Address;
  userOperations: UserOperation[];
  owners: {
    id: string;
    address: string;
    weight: number;
  }[];
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const OpCreateDialog: FC<OpCreateDialogProps> = ({
  address,
  userOperations,
  owners,
}) => {
  const { address: userAddress } = useAuth();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const owner = useMemo(() => {
    if (!userAddress) return;

    return owners?.find(owner =>
      isAddressEqual(owner.address as Address, userAddress),
    );
  }, [owners, userAddress]);

  return (
    <>
      <div className="mt-4 flex flex-col space-y-3 text-center sm:text-left">
        <header className="text-lg font-semibold leading-none tracking-tight">
          Transaction
        </header>
        <p className="text-sm text-text-weak">
          Are you sure you want to sign this transaction?
        </p>
        {userOperations?.map((userOperation, index) => (
          <OpConfirmCard
            key={index}
            address={address}
            owners={owners}
            userOperation={userOperation}
          />
        ))}
      </div>
    </>
  );
};
