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
import type { UserOperation } from "@lightdotso/schemas";
import { useAuth } from "@lightdotso/stores";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@lightdotso/ui";
import { useMemo, useState } from "react";
import type { FC } from "react";
import { isAddressEqual } from "viem";
import type { Address } from "viem";
import { OpCreateCard } from "@/app/(wallet)/[address]/op/(components)/op-create-card";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type OpCreateDialogProps = {
  address: Address;
  config: ConfigurationData;
  userOperations: UserOperation[];
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const OpCreateDialog: FC<OpCreateDialogProps> = ({
  address,
  config,
  userOperations,
}) => {
  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [selectedOpIndex, setSelectedOpIndex] = useState<number>(0);

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { address: userAddress } = useAuth();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const owner = useMemo(() => {
    if (!userAddress) return;

    return config.owners?.find(owner =>
      isAddressEqual(owner.address as Address, userAddress),
    );
  }, [config.owners, userAddress]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

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
        <OpCreateCard
          key={selectedOpIndex}
          address={address}
          config={config}
          userOperation={userOperations[selectedOpIndex]}
        />
      )}
    </div>
  );
};
