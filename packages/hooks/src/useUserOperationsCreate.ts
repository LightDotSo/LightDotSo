// Copyright 2023-2024 LightDotSo.
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

import {
  useMutationUserOperationCreate,
  useMutationUserOperationCreateBatch,
  useQueryConfiguration,
} from "@lightdotso/query";
import { subdigestOf } from "@lightdotso/sequence";
import { useAuth, useUserOperations } from "@lightdotso/stores";
import { toast } from "@lightdotso/ui";
import { useSignMessage } from "@lightdotso/wagmi/wagmi";
import { MerkleTree } from "merkletreejs";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Address, Hex } from "viem";
import { hexToBytes, isAddressEqual, keccak256, toBytes } from "viem";

// -----------------------------------------------------------------------------
// Hook Props
// -----------------------------------------------------------------------------

type UserOperationsCreateProps = {
  address: Address;
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useUserOperationsCreate = ({
  address,
}: UserOperationsCreateProps) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { address: userAddress } = useAuth();

  const {
    addPendingUserOperationMerkleRoot,
    addPendingUserOperationHash,
    userOperations,
    resetUserOperations,
  } = useUserOperations();
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.info("userOperations", userOperations);

  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [merkleTree, setMerkleTree] = useState<MerkleTree | undefined>();
  const [signedData, setSignedData] = useState<Hex>();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { configuration } = useQueryConfiguration({
    address: address as Address,
  });

  // ---------------------------------------------------------------------------
  // Local Variables
  // ---------------------------------------------------------------------------

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const subdigest = useMemo(() => {
    // If the userOperation length is 0, return
    if (userOperations.length === 0) {
      return;
    }

    // If the userOperation length is 1, get the first userOperation
    const userOperation = userOperations[0];

    // Check if the userOperation has hash and chainId
    if (!(userOperation?.hash && userOperation?.chainId)) {
      return;
    }

    // Return the subdigest of the userOperation w/ hash and chainId encoded (type 1)
    if (userOperations.length === 1) {
      return subdigestOf(
        address,
        hexToBytes(userOperation?.hash as Hex),
        userOperation?.chainId,
      );
    }

    // Check if all of the userOperations have hash
    const isAllHashed = userOperations.every(
      (userOperation) => userOperation.hash,
    );
    if (!isAllHashed) {
      return;
    }

    // If the userOperation length is greater than 1, get the merkle root of the userOperations
    if (userOperations.length > 1) {
      // Get the leaves of the merkle tree
      const leaves = userOperations
        .map((userOperation) => hexToBytes(userOperation.hash as Hex))
        .sort(Buffer.compare);

      // Create a merkle tree from the leaves, with sort option enabled
      const tree = new MerkleTree(leaves, keccak256, { sort: true });

      setMerkleTree(tree);

      return subdigestOf(address, tree.getRoot(), BigInt(0));
    }
  }, [
    // Solely dependent on userOperations for the subdigest
    userOperations,
  ]);

  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  // Sign the message of the subdigest
  const { data, signMessage } = useSignMessage();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  // Get the owner of the userOperation from the configuration
  // Should default to lastest configuration
  const owner = useMemo(() => {
    if (!userAddress) {
      return;
    }

    return configuration?.owners?.find((owner) =>
      isAddressEqual(owner.address as Address, userAddress),
    );
  }, [configuration?.owners, userAddress]);

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  // Reset the signed data, merkle tree, and userOperations
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const resetUserOperationsCreate = useCallback(() => {
    setSignedData(undefined);
    setMerkleTree(undefined);
    resetUserOperations();
  }, []);

  // Sign the userOperation
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const signUserOperations = useCallback(() => {
    if (!subdigest) {
      return;
    }

    signMessage({ message: { raw: toBytes(subdigest) } });
  }, [subdigest]);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { userOperationCreate } = useMutationUserOperationCreate({
    address: address as Address,
  });

  const { userOperationCreateBatch } = useMutationUserOperationCreateBatch({
    address: address as Address,
  });

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // Sync the signed data
  useEffect(() => {
    if (!data) {
      return;
    }

    setSignedData(data);
  }, [data]);

  // Create the userOperation (single or batch)
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    // Create a single user operation
    const createUserOp = () => {
      if (!(owner && signedData && userOperation)) {
        toast.error("Invalid user operation!");
        return;
      }

      // Create a single user operation
      userOperationCreate({
        ownerId: owner.id,
        signedData: signedData as Hex,
        userOperation: userOperation,
      });

      // Add the user operation hash to the pending user operations
      addPendingUserOperationHash(userOperation.hash as Hex);

      // Reset the signed data
      setSignedData(undefined);
    };

    // Create a batch of user operations
    const createUserOpBatch = () => {
      if (!(owner && signedData && merkleTree && userOperations)) {
        toast.error("Invalid user operations!");
        return;
      }

      // Get the merkle root of the user operations
      const merkleRoot = `0x${merkleTree.getRoot().toString("hex")}` as Hex;

      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.info("merkleRoot", merkleRoot);

      // Create a batch of user operations
      userOperationCreateBatch({
        ownerId: owner.id,
        signedData: signedData as Hex,
        userOperations: userOperations,
        merkleRoot: merkleRoot,
      });

      // Add the merkle root to the pending user operations
      addPendingUserOperationMerkleRoot(merkleRoot);

      // Add the user operation hashes to the pending user operations
      for (const userOperation of userOperations) {
        addPendingUserOperationHash(userOperation.hash as Hex);
      }

      // Reset the signed data
      setSignedData(undefined);
    };

    // If the userOperations length is 0, return
    if (userOperations.length === 0) {
      return;
    }

    // If the signed data is undefined, return
    if (!signedData) {
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
  }, [signedData, owner, userOperations, configuration?.threshold, address]);

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  // Check if the userOperations are valid
  // Should be all defined and not undefined for all required fields
  const isValidUserOperations = useMemo(() => {
    return (
      userOperations &&
      userOperations.length > 0 &&
      userOperations.every((userOperation) => {
        return !!(
          typeof owner !== "undefined" &&
          userOperation &&
          userOperation.chainId &&
          userOperation.hash &&
          typeof userOperation.nonce !== "undefined" &&
          userOperation.initCode &&
          userOperation.sender &&
          userOperation.callData &&
          typeof userOperation.callGasLimit !== "undefined" &&
          userOperation.verificationGasLimit &&
          userOperation.preVerificationGas &&
          userOperation.maxFeePerGas &&
          userOperation.maxPriorityFeePerGas &&
          userOperation.paymasterAndData
        );
      })
    );
  }, [owner, userOperations]);
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.info("isValidUserOperations", isValidUserOperations);

  // Check if the current subdigest is equal to the merkle tree root if the userOperations length is greater than 1
  const isUserOperationsMerkleEqual = useMemo(() => {
    if (userOperations.length > 1) {
      return (
        typeof merkleTree !== "undefined" &&
        subdigest === subdigestOf(address, merkleTree.getRoot(), BigInt(0))
      );
    }

    return true;
  }, [address, userOperations.length, merkleTree, subdigest]);
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.info("isUserOperationsMerkleEqual", isUserOperationsMerkleEqual);

  // Check if the userOperation is submittable under the current owner signature
  // The configuration threshold should be defined and the owner weight should be greater than or equal to the threshold
  const isUserOperationsCreateSubmittable = useMemo(() => {
    return (
      typeof configuration?.threshold !== "undefined" &&
      typeof owner !== "undefined" &&
      configuration?.threshold <= owner?.weight
    );
  }, [owner, configuration?.threshold]);
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.info(
    "isUserOperationsCreateSubmittable",
    isUserOperationsCreateSubmittable,
  );

  // Check if the userOperation is createable
  const isUserOperationsCreateable = useMemo(() => {
    return typeof owner !== "undefined" && typeof subdigest !== "undefined";
  }, [owner, subdigest]);
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.info("isUserOperationsCreateable", isUserOperationsCreateable);

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  // Set the transaction disabled state
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const isUserOperationsDisabled = useMemo(() => {
    // A combination of conditions that would disable the transaction
    return (
      // Nor if the user operations are not valid
      !(
        isValidUserOperations &&
        isUserOperationsCreateable &&
        isUserOperationsMerkleEqual
      )
    );
  }, [
    subdigest,
    isValidUserOperations,
    isUserOperationsCreateable,
    isUserOperationsMerkleEqual,
  ]);
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.info("isUserOperationsDisabled", isUserOperationsDisabled);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    isUserOperationsCreateable: isUserOperationsCreateable,
    isUserOperationsMerkleEqual: isUserOperationsMerkleEqual,
    isUserOperationsCreateSubmittable: isUserOperationsCreateSubmittable,
    isUserOperationsDisabled: isUserOperationsDisabled,
    isValidUserOperations: isValidUserOperations,
    resetUserOperationsCreate: resetUserOperationsCreate,
    signUserOperations: signUserOperations,
    subdigest: subdigest,
    owner: owner,
    threshold: configuration?.threshold,
  };
};
