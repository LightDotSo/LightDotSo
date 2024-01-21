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

import { createSignature } from "@lightdotso/client";
import type { ConfigurationData, UserOperationData } from "@lightdotso/data";
import { subdigestOf } from "@lightdotso/solutions";
import { useAuth } from "@lightdotso/stores";
import { toast } from "@lightdotso/ui";
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
import { useSignMessage } from "wagmi";

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

  const isSignable = useMemo(() => {
    if (!userAddress || (userAddress && !isAddress(userAddress as Address))) {
      return;
    }

    // Check if the user is an owner
    const isOwner = owners.some(
      owner => owner.address === getAddress(userAddress as Address),
    );

    // Check if the user has already signed
    const isSigned = userOperation.signatures.some(
      signature => signature.owner_id === userOwnerId,
    );

    return isOwner && !isSigned;
  }, [owners, userOperation.signatures, userAddress, userOwnerId]);

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

      const toastId = toast.loading("Submitting the userOperation result");

      const res = await createSignature({
        params: {
          query: {
            user_operation_hash: userOperation.hash,
          },
        },
        body: {
          signature: {
            owner_id: userOwnerId,
            signature: toHex(new Uint8Array([...toBytes(signedMessage), 2])),
            signature_type: 1,
          },
        },
      });

      toast.dismiss(toastId);

      res.match(
        _ => {
          toast.success("You submitted the userOperation result");
        },
        err => {
          if (err instanceof Error) {
            toast.error(err.message);
          } else {
            toast.error("An unknown error occurred");
          }
        },
      );
    };

    processSignature();

    // Unset loading state
    setIsLoading(false);
  }, [signMessage, signedMessage, userOperation, userOwnerId]);

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
    isSignable,
    signedMessage,
    signUserOperation,
  };
};
