// Copyright 2023-2024 Light
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

import type { ConfigurationData, UserOperationData } from "@lightdotso/data";
import { useMutationSignatureCreate } from "@lightdotso/query";
import { subdigestOf } from "@lightdotso/sequence";
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
        signature: toHex(new Uint8Array(toBytes(signedMessage))),
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
    isLoading: isLoading,
    isOwner: isOwner,
    isSigned: isSigned,
    isSignable: isSignable,
    signedMessage: signedMessage,
    signUserOperation: signUserOperation,
  };
};
