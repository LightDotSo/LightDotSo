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

import type { ConfigurationData } from "@lightdotso/data";
import { useMutationUserOperationCreate } from "@lightdotso/query";
import type { UserOperation } from "@lightdotso/schemas";
import { subdigestOf } from "@lightdotso/sequence";
import { useAuth, useModalSwiper } from "@lightdotso/stores";
import {
  useSignMessage,
  lightWalletAbi,
  lightWalletFactoryAbi,
  // useReadLightVerifyingPaymasterGetHash,
  // useReadLightVerifyingPaymasterSenderNonce,
} from "@lightdotso/wagmi";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Address, Hex } from "viem";
import {
  isAddressEqual,
  toBytes,
  hexToBytes,
  // fromHex,
  decodeFunctionData,
} from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type UserOperationCreateProps = {
  address: Address;
  configuration?: ConfigurationData | null | undefined;
  userOperation?: Partial<UserOperation> | null | undefined;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const useUserOperationCreate = ({
  address,
  configuration,
  userOperation,
}: UserOperationCreateProps) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { address: userAddress } = useAuth();
  const { setPageIndex } = useModalSwiper();

  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [isUserOperationLoading, setIsUserOperationLoading] = useState(false);
  const [signedData, setSignedData] = useState<Hex>();

  // ---------------------------------------------------------------------------
  // Local Variables
  // ---------------------------------------------------------------------------

  const subdigest = useMemo(() => {
    if (!userOperation?.hash || !userOperation?.chainId) {
      return;
    }

    return subdigestOf(
      address,
      hexToBytes(userOperation?.hash as Hex),
      userOperation?.chainId,
    );
  }, [address, userOperation?.hash, userOperation?.chainId]);

  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  const { data, signMessage, isPending: isSignLoading } = useSignMessage();

  // const { data: paymasterNonce } = useReadLightVerifyingPaymasterSenderNonce({
  //   address: userOperation.paymasterAndData.slice(0, 42) as Address,
  //   chainId: Number(userOperation.chainId),
  //   args: [userOperation.sender as Address],
  // });

  // const { data: paymasterHash } = useReadLightVerifyingPaymasterGetHash({
  //   address: userOperation.paymasterAndData.slice(0, 42) as Address,
  //   chainId: Number(userOperation.chainId),
  //   args: [
  //     {
  //       sender: userOperation.sender as Address,
  //       nonce: userOperation.nonce,
  //       initCode: userOperation.initCode as Hex,
  //       callData: userOperation.callData as Hex,
  //       callGasLimit: userOperation.callGasLimit,
  //       verificationGasLimit: userOperation.verificationGasLimit,
  //       preVerificationGas: userOperation.preVerificationGas,
  //       maxFeePerGas: userOperation.maxFeePerGas,
  //       maxPriorityFeePerGas: userOperation.maxPriorityFeePerGas,
  //       paymasterAndData: userOperation.paymasterAndData as Hex,
  //       signature: toHex(new Uint8Array([2])),
  //     },
  //     fromHex(`0x${userOperation.paymasterAndData.slice(154, 162)}`, "number"),
  //     fromHex(`0x${userOperation.paymasterAndData.slice(162, 170)}`, "number"),
  //   ],
  // });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const owner = useMemo(() => {
    if (!userAddress) {
      return;
    }

    return configuration?.owners?.find(owner =>
      isAddressEqual(owner.address as Address, userAddress),
    );
  }, [configuration?.owners, userAddress]);

  const decodedInitCode = useMemo(() => {
    // If the initCode is `0x`, return
    if (
      !userOperation?.callData ||
      !userOperation?.initCode ||
      userOperation?.initCode === "0x"
    ) {
      return;
    }

    // Parse the initCode of the userOperation
    return decodeFunctionData({
      abi: lightWalletFactoryAbi,
      data: `0x${userOperation?.initCode.slice(42)}` as Hex,
    }).args;
  }, [userOperation?.initCode, userOperation?.callData]);

  const decodedCallData = useMemo(() => {
    // If the callData is `0x`, return
    if (!userOperation?.callData || userOperation?.callData === "0x") {
      return;
    }

    // Parse the callData of tha args depending on the args type
    switch (userOperation?.callData.slice(0, 10)) {
      // If the function selector is `execute` or `executeBatch`
      case "0xb61d27f6":
      case "0x47e1da2a":
        return decodeFunctionData({
          abi: lightWalletAbi,
          data: userOperation?.callData as Hex,
        }).args;
      default:
        return userOperation?.callData;
    }
  }, [userOperation?.callData]);

  const isValidUserOperation = useMemo(() => {
    return !!(
      typeof owner !== "undefined" &&
      userOperation &&
      userOperation.chainId &&
      userOperation.hash &&
      userOperation.nonce !== undefined &&
      userOperation.nonce !== null &&
      userOperation.initCode &&
      userOperation.sender &&
      userOperation.callData &&
      userOperation.callGasLimit &&
      userOperation.verificationGasLimit &&
      userOperation.preVerificationGas &&
      userOperation.maxFeePerGas &&
      userOperation.maxPriorityFeePerGas &&
      userOperation.paymasterAndData
    );
  }, [owner, userOperation]);

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  const signUserOperation = useCallback(() => {
    if (!subdigest) {
      return;
    }

    signMessage({ message: { raw: toBytes(subdigest) } });
  }, [subdigest, signMessage]);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { userOperationCreate } = useMutationUserOperationCreate({
    address: address,
  });

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // Sync the loading state
  useEffect(() => {
    setIsUserOperationLoading(isSignLoading);
  }, [isSignLoading]);

  // Sync the signed data
  useEffect(() => {
    if (!data) {
      return;
    }

    setSignedData(data);
  }, [data]);

  useEffect(() => {
    const createUserOp = async () => {
      if (!owner || !signedData || !userOperation) {
        return;
      }

      await userOperationCreate({
        ownerId: owner.id,
        signedData: signedData as Hex,
        userOperation: userOperation,
      });

      setSignedData(undefined);
    };

    createUserOp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedData, owner, userOperation, configuration?.threshold, address]);

  useEffect(() => {
    if (isUserOperationLoading) {
      setPageIndex(1);
    } else {
      setPageIndex(0);
    }
  }, [isUserOperationLoading, setPageIndex]);

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isUserOperationCreatable = useMemo(() => {
    return (
      !isUserOperationLoading &&
      typeof owner !== "undefined" &&
      isValidUserOperation
    );
  }, [isUserOperationLoading, owner, isValidUserOperation]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return {
    isUserOperationCreatable,
    isUserOperationLoading,
    isValidUserOperation,
    decodedCallData,
    decodedInitCode,
    // paymasterHash,
    // paymasterNonce,
    signUserOperation,
    subdigest,
    owner,
    threshold: configuration?.threshold,
  };
};
