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
import type { UserOperations } from "@/schemas";
import { useAuth } from "@/stores/useAuth";
// import { user } from "@/queries/user";
// import { OpConfirm } from "./op-confirm-card";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type OpConfirmDialogProps = {
  address: Address;
  userOperations: UserOperations;
  owners: {
    id: string;
    address: string;
    weight: number;
  }[];
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const OpConfirmDialog: FC<OpConfirmDialogProps> = ({
  // address,
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
          <div key={index} aria-label={userOperation.callData} />
        ))}
      </div>
    </>
  );
};
