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

import { subdigestOf } from "@lightdotso/solutions";
import { useMemo } from "react";
import { hexToBytes, type Address, type Hex, getAddress, toBytes } from "viem";
import { useSignMessage } from "wagmi";
import type { ConfigurationData, UserOperationData } from "@/data";
import { useAuth } from "@/stores";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type UserOperationSignProps = {
  address: Address;
  config: ConfigurationData;
  userOperation: UserOperationData;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const useUserOperationSign = ({
  address,
  config: { owners },
  userOperation,
}: UserOperationSignProps) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { address: userAddress } = useAuth();

  // ---------------------------------------------------------------------------
  // Local Variables
  // ---------------------------------------------------------------------------

  const subdigest = subdigestOf(
    address,
    hexToBytes(userOperation.hash as Hex),
    BigInt(userOperation.chain_id),
  );

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isSignable = useMemo(() => {
    // Check if the user is an owner
    const isOwner = owners.some(
      owner => owner.address === getAddress(userAddress as Address),
    );

    // Map the user id to the owner id
    const userId = owners.find(owner => owner.address === userAddress)?.id;

    // Check if the user has already signed
    const isSigned = userOperation.signatures.some(
      signature => signature.owner_id === userId,
    );

    return isOwner && !isSigned;
  }, [owners, userOperation, userAddress]);

  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  const { data: signedMessage, signMessage } = useSignMessage({
    message: { raw: toBytes(subdigest) },
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return {
    isSignable,
    signedMessage,
    signMessage,
  };
};
