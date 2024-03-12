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

import { useUserOperationsQueryState } from "@lightdotso/nuqs";
import {
  useMutationUserOperationCreate,
  useMutationUserOperationCreateBatch,
  useQueryConfiguration,
} from "@lightdotso/query";
import { subdigestOf } from "@lightdotso/sequence";
import { useAuth, useModalSwiper } from "@lightdotso/stores";
import {
  useSignMessage,
  // lightWalletAbi,
  // lightWalletFactoryAbi,
  // useReadLightVerifyingPaymasterGetHash,
  // useReadLightVerifyingPaymasterSenderNonce,
} from "@lightdotso/wagmi";
import { MerkleTree } from "merkletreejs";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Address, Hex } from "viem";
import {
  isAddressEqual,
  toBytes,
  hexToBytes,
  keccak256,
  // fromHex,
  // decodeFunctionData,
} from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type UserOperationCreateProps = {
  address: Address;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const useUserOperationCreate = ({
  address,
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
  const [merkleTree, setMerkleTree] = useState<MerkleTree | undefined>();
  const [signedData, setSignedData] = useState<Hex>();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { configuration } = useQueryConfiguration({
    address: address,
  });

  // ---------------------------------------------------------------------------
  // Query State Hooks
  // ---------------------------------------------------------------------------

  const [userOperations] = useUserOperationsQueryState();

  // ---------------------------------------------------------------------------
  // Local Variables
  // ---------------------------------------------------------------------------

  const subdigest = useMemo(() => {
    // If the userOperation length is 0, return
    if (userOperations.length === 0) {
      return;
    }

    // If the userOperation length is 1, get the first userOperation
    const userOperation = userOperations[0];
    if (!userOperation?.hash || !userOperation?.chainId) {
      return;
    }

    if (userOperations.length === 1) {
      return subdigestOf(
        address,
        hexToBytes(userOperation?.hash as Hex),
        userOperation?.chainId,
      );
    }

    // If the userOperation length is greater than 1, get the merkle root of the userOperations
    if (userOperations.length > 1) {
      const leaves = userOperations
        .sort((a, b) => Number(a.chainId) - Number(b.chainId))
        .map(userOperation => hexToBytes(userOperation.hash as Hex));
      const tree = new MerkleTree(leaves, keccak256, { sort: true });
      setMerkleTree(tree);
      return subdigestOf(address, tree.getRoot(), BigInt(0));
    }
  }, [address, userOperations]);

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

  // const decodedInitCode = useMemo(() => {
  //   // If the initCode is `0x`, return
  //   if (
  //     !userOperation?.callData ||
  //     !userOperation?.initCode ||
  //     userOperation?.initCode === "0x"
  //   ) {
  //     return;
  //   }

  //   // Parse the initCode of the userOperation
  //   return decodeFunctionData({
  //     abi: lightWalletFactoryAbi,
  //     data: `0x${userOperation?.initCode.slice(42)}` as Hex,
  //   }).args;
  // }, [userOperation?.initCode, userOperation?.callData]);

  // const decodedCallData = useMemo(() => {
  //   // If the callData is `0x`, return
  //   if (!userOperation?.callData || userOperation?.callData === "0x") {
  //     return;
  //   }

  //   // Parse the callData of tha args depending on the args type
  //   switch (userOperation?.callData.slice(0, 10)) {
  //     // If the function selector is `execute` or `executeBatch`
  //     case "0xb61d27f6":
  //     case "0x47e1da2a":
  //       return decodeFunctionData({
  //         abi: lightWalletAbi,
  //         data: userOperation?.callData as Hex,
  //       }).args;
  //     default:
  //       return userOperation?.callData;
  //   }
  // }, [userOperation?.callData]);

  const isValidUserOperations = useMemo(() => {
    return userOperations.every(userOperation => {
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
    });
  }, [owner, userOperations]);

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

  const { userOperationCreateBatch } = useMutationUserOperationCreateBatch({
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

      userOperationCreate({
        ownerId: owner.id,
        signedData: signedData as Hex,
        userOperation: userOperation,
      });

      setSignedData(undefined);
    };

    const createUserOpBatch = async () => {
      if (!owner || !signedData || !merkleTree || !userOperations) {
        return;
      }

      console.info(merkleTree);
      console.info(`0x${merkleTree.getRoot().toString("hex")}` as Hex);

      userOperationCreateBatch({
        ownerId: owner.id,
        signedData: signedData as Hex,
        userOperations: userOperations,
        merkleRoot: `0x${merkleTree.getRoot().toString("hex")}` as Hex,
      });

      setSignedData(undefined);
    };

    // If the userOperations length is 0, return
    if (userOperations.length === 0) {
      return;
    }

    // If the userOperations length is 1, get the first userOperation
    const userOperation = userOperations[0];
    if (userOperations.length === 1) {
      createUserOp();
      return;
    }

    // If the userOperations length is greater than 1
    if (userOperations.length > 1) {
      createUserOpBatch();
      return;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedData, owner, userOperations, configuration?.threshold, address]);

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
      isValidUserOperations
    );
  }, [isUserOperationLoading, owner, isValidUserOperations]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return {
    isUserOperationCreatable,
    isUserOperationLoading,
    isValidUserOperations,
    // decodedCallData,
    // decodedInitCode,
    // paymasterHash,
    // paymasterNonce,
    signUserOperation,
    subdigest,
    owner,
    threshold: configuration?.threshold,
  };
};
