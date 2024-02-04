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

import type { ConfigurationData, UserOperationData } from "@lightdotso/data";
import { useMutationSignatureCreate } from "@lightdotso/query";
import { subdigestOf } from "@lightdotso/solutions";
import { useAuth } from "@lightdotso/stores";
import { useSignMessage } from "@lightdotso/wagmi";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  hexToBytes,
  type Address,
  type Hex,
  getAddress,
  toBytes,
  toHex,
  isAddress,
} from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type UserOperationSignProps = {
  address: Address;
  configuration: ConfigurationData;
  userOperation: UserOperationData;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const useUserOperationSign = ({
  address,
  configuration: { owners },
  userOperation,
}: UserOperationSignProps) => {
  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [isLoading, setIsLoading] = useState(false);

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { address: userAddress } = useAuth();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const userOwnerId = useMemo(() => {
    // Map the user id to the owner id
    return owners.find(owner => owner.address === userAddress)?.id;
  }, [owners, userAddress]);

  const isOwner = useMemo(() => {
    if (!userAddress || (userAddress && !isAddress(userAddress as Address))) {
      return false;
    }

    // Check if the user is an owner
    return owners.some(
      owner => owner.address === getAddress(userAddress as Address),
    );
  }, [owners, userAddress]);

  const isSigned = useMemo(() => {
    if (!userAddress || (userAddress && !isAddress(userAddress as Address))) {
      return false;
    }

    // Check if the user has already signed
    return userOperation.signatures.some(
      signature => signature.owner_id === userOwnerId,
    );
  }, [userAddress, userOperation.signatures, userOwnerId]);

  const isSignable = useMemo(() => {
    // Check if the user has not yet signed and is an owner
    return !isSigned && isOwner && !isLoading;
  }, [isSigned, isOwner, isLoading]);

  const subdigest = useMemo(
    () =>
      subdigestOf(
        address,
        hexToBytes(userOperation.hash as Hex),
        BigInt(userOperation.chain_id),
      ),
    [address, userOperation.hash, userOperation.chain_id],
  );

  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  const {
    data: signedMessage,
    isPending: isSignLoading,
    signMessage,
  } = useSignMessage();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { signatureCreate } = useMutationSignatureCreate({
    user_operation_hash: userOperation.hash as Hex,
  });

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // Sync the loading state
  useEffect(() => {
    setIsLoading(isSignLoading);
  }, [isSignLoading]);

  // A handler for submitting the signature
  useEffect(() => {
    // Set loading state
    setIsLoading(true);

    const processSignature = async () => {
      if (!userOwnerId || !signedMessage) {
        return;
      }

      await signatureCreate({
        owner_id: userOwnerId,
        signature: toHex(new Uint8Array([...toBytes(signedMessage), 2])),
        signature_type: 1,
      });
    };

    processSignature();

    // Unset loading state
    setIsLoading(false);
  }, [signMessage, signatureCreate, signedMessage, userOperation, userOwnerId]);

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  const signUserOperation = useCallback(() => {
    signMessage({ message: { raw: toBytes(subdigest) } });
  }, [subdigest, signMessage]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return {
    isLoading,
    isOwner,
    isSigned,
    isSignable,
    signedMessage,
    signUserOperation,
  };
};
