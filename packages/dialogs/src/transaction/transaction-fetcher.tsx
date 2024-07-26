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

import { WALLET_FACTORY_ENTRYPOINT_MAPPING } from "@lightdotso/const";
import { useDebouncedValue } from "@lightdotso/hooks";
import {
  useQueryConfiguration,
  useQueryPaymasterGasAndPaymasterAndData,
  useQueryUserOperationNonce,
  useQueryUserOperations,
  useQueryWallet,
  useQueryUserOperationEstimateGas,
  useQueryUserOperationEstimateFeesPerGas,
} from "@lightdotso/query";
import { type UserOperation } from "@lightdotso/schemas";
import { calculateInitCode } from "@lightdotso/sequence";
import { useFormRef, useUserOperations } from "@lightdotso/stores";
import { findContractAddressByAddress } from "@lightdotso/utils";
import {
  useBytecode,
  useReadEntryPointGetNonce,
  useReadLightWalletImageHash,
} from "@lightdotso/wagmi";
import { getUserOperationHash } from "permissionless";
import type {
  UserOperation as PermissionlessUserOperation,
  ENTRYPOINT_ADDRESS_V06,
} from "permissionless";
import { type FC, useMemo, useEffect, useState } from "react";
import { type Hex, type Address } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type TransactionFetcherProps = {
  address: Address;
  initialUserOperation: Partial<UserOperation>;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TransactionFetcher: FC<TransactionFetcherProps> = ({
  address,
  initialUserOperation,
}) => {
  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [userOperationWithHash, setUserOperationWithHash] =
    useState<UserOperation>();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { setIsFormLoading } = useFormRef();
  const {
    setPartialUserOperationByChainIdAndNonce,
    setUserOperationByChainIdAndNonce,
  } = useUserOperations();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { configuration: genesisConfiguration } = useQueryConfiguration({
    address: address as Address,
    checkpoint: 0,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { configuration: currentConfiguration } = useQueryConfiguration({
    address: address as Address,
  });

  const { wallet } = useQueryWallet({
    address: address as Address,
  });

  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  // Get the image hash for the light wallet
  const { data: imageHash } = useReadLightWalletImageHash({
    address: address as Address,
    chainId: Number(initialUserOperation.chainId),
  });

  // Get the nonce for the entry point
  const { data: entryPointNonce } = useReadEntryPointGetNonce({
    address: WALLET_FACTORY_ENTRYPOINT_MAPPING[
      findContractAddressByAddress(wallet?.factory_address as Address)!
    ] as typeof ENTRYPOINT_ADDRESS_V06,
    chainId: Number(initialUserOperation.chainId),
    args: [address as Address, 0n],
  });

  // Get the bytecode for the light wallet
  const { data: walletBytecode } = useBytecode({
    address: address as Address,
    chainId: Number(initialUserOperation.chainId),
  });

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  // Also, get the wallet billing
  // const { walletBilling, isWalletBillingLoading } = useQueryWalletBilling({
  //   address: address as Address,
  // });

  // Gets the configuration for the chain w/ the image hash
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { configuration } = useQueryConfiguration({
    address: address as Address,
    image_hash: imageHash,
  });

  // Gets the user operation nonce
  const { userOperationNonce } = useQueryUserOperationNonce({
    address: address as Address,
    chain_id: Number(initialUserOperation.chainId),
  });

  // Gets the history of user operations
  const { userOperations: historyUserOperations } = useQueryUserOperations({
    address: address as Address,
    status: "history",
    offset: 0,
    limit: 1,
    order: "asc",
    is_testnet: true,
    chain_id: Number(initialUserOperation.chainId) as number,
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  // Turns the partial userOperation into an userOperation w/ default values
  // Should not change from the initial user operation
  const targetUserOperation: Partial<
    Omit<UserOperation, "hash" | "paymasterAndData" | "signature">
  > = useMemo(() => {
    // Get the minimum nonce from the user operation nonce and the partial user operation
    const updatedMinimumNonce =
      entryPointNonce !== undefined
        ? BigInt(entryPointNonce)
        : userOperationNonce?.nonce !== undefined
          ? BigInt(userOperationNonce?.nonce)
          : undefined;

    // Get the init code from the executed user operations or the partial user operation
    const updatedInitCode =
      ((historyUserOperations && historyUserOperations?.length < 1) ||
        typeof walletBytecode === "undefined") &&
      wallet?.factory_address &&
      genesisConfiguration?.image_hash &&
      wallet?.salt
        ? calculateInitCode(
            wallet?.factory_address as Address,
            // Compute w/ the genesis configuration image hash
            genesisConfiguration?.image_hash as Hex,
            wallet?.salt as Hex,
          )
        : (initialUserOperation.initCode ?? "0x");

    // If the initial user operation nonce is provided, make sure it is same or greater
    // In the case that it is not, update the nonce to the minimum nonce
    const updatedNonce =
      typeof initialUserOperation.nonce === "undefined" ||
      (initialUserOperation.nonce !== undefined &&
        updatedMinimumNonce !== undefined &&
        initialUserOperation.nonce < updatedMinimumNonce)
        ? updatedMinimumNonce
        : updatedInitCode !== "0x"
          ? BigInt(0)
          : initialUserOperation.nonce;

    // Allow the callData to be empty if the init code is provided
    // This is to allow for the creation of a new contract
    const updatedCallData =
      typeof initialUserOperation.callData === "undefined" &&
      updatedInitCode !== undefined
        ? "0x"
        : initialUserOperation.callData;

    // Return the user operation
    return {
      sender: initialUserOperation?.sender ?? address,
      chainId: initialUserOperation?.chainId ?? undefined,
      // Init code should be computed automatically
      initCode: updatedInitCode ?? "0x",
      nonce: updatedNonce ?? undefined,
      callData: updatedCallData ?? undefined,
      callGasLimit: initialUserOperation?.callGasLimit ?? undefined,
      verificationGasLimit:
        initialUserOperation?.verificationGasLimit ?? undefined,
      preVerificationGas: initialUserOperation?.preVerificationGas ?? undefined,
      maxFeePerGas: initialUserOperation?.maxFeePerGas ?? undefined,
      maxPriorityFeePerGas:
        initialUserOperation?.maxPriorityFeePerGas ?? undefined,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // The wallet is required to compute the init code
    wallet,
    // The genesis configuration is static
    genesisConfiguration,
    // Should recompute if the bytecode changes
    walletBytecode,
    // Should recompute if the executed user operations change, for init code
    historyUserOperations,
    // Should recompute if the entry point nonce changes
    entryPointNonce,
    // Should recompute if the user operation nonce changes
    userOperationNonce?.nonce,
  ]);
  console.info("targetUserOperation", targetUserOperation);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  // Get the gas estimate for the user operation
  const {
    maxFeePerGas,
    maxPriorityFeePerGas,
    isUserOperationEstimateFeesPerGasLoading,
  } = useQueryUserOperationEstimateFeesPerGas({
    address: address as Address,
    chainId: Number(targetUserOperation?.chainId),
    callData: targetUserOperation?.callData as Hex,
  });
  console.info("maxFeePerGas", maxFeePerGas);
  console.info("maxPriorityFeePerGas", maxPriorityFeePerGas);

  // Gets the gas estimate for the user operation
  const {
    callGasLimit,
    preVerificationGas,
    verificationGasLimit,
    isUserOperationEstimateGasLoading,
  } = useQueryUserOperationEstimateGas({
    sender: address as Address,
    chainId: targetUserOperation?.chainId,
    nonce: targetUserOperation?.nonce,
    initCode: targetUserOperation?.initCode,
    callData: targetUserOperation?.callData,
  });
  console.info("callGasLimit", callGasLimit);
  console.info("preVerificationGas", preVerificationGas);
  console.info("verificationGasLimit", verificationGasLimit);

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  // Construct the updated user operation
  // This is the final layer of computation until getting the hash for paymaster and data
  const updatedUserOperation: Omit<
    UserOperation,
    "hash" | "signature" | "paymasterAndData"
  > | null = useMemo(() => {
    if (
      !targetUserOperation?.sender ||
      !targetUserOperation?.chainId ||
      !targetUserOperation?.initCode ||
      typeof targetUserOperation?.nonce === "undefined" ||
      targetUserOperation?.nonce === null ||
      !targetUserOperation?.callData ||
      !maxFeePerGas ||
      !maxPriorityFeePerGas ||
      !callGasLimit ||
      !preVerificationGas ||
      !verificationGasLimit
    ) {
      return null;
    }

    // Bump the verification gas limit depending on the configuration threshold
    const updatedVerificationGasLimit =
      currentConfiguration?.threshold && verificationGasLimit
        ? verificationGasLimit * BigInt(currentConfiguration?.threshold)
        : verificationGasLimit;

    // Bump the pre-verification gas limit to handle lesser used chains
    const updatedPreVerificationGas = preVerificationGas
      ? (preVerificationGas * BigInt(120)) / BigInt(100)
      : preVerificationGas;

    return {
      sender: targetUserOperation?.sender,
      chainId: targetUserOperation?.chainId,
      initCode: targetUserOperation?.initCode,
      nonce: targetUserOperation?.nonce,
      callData: targetUserOperation?.callData,
      maxFeePerGas: maxFeePerGas,
      maxPriorityFeePerGas: maxPriorityFeePerGas,
      callGasLimit: callGasLimit,
      preVerificationGas: updatedPreVerificationGas,
      verificationGasLimit: updatedVerificationGasLimit,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Only gas limits and fees are required to compute the gas limits
    // The rest of the values are dependencies of the gas limits
    // As it is the final layer of computation
    maxFeePerGas,
    maxPriorityFeePerGas,
    callGasLimit,
    preVerificationGas,
    verificationGasLimit,
  ]);
  console.info("updatedUserOperation", updatedUserOperation);

  // ---------------------------------------------------------------------------
  // Debounce
  // ---------------------------------------------------------------------------

  const [debouncedUserOperation, isDebouncingUserOperation] = useDebouncedValue(
    updatedUserOperation,
    300,
  );
  console.info("debouncedUserOperation", debouncedUserOperation);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  // Get the paymaster and data from the target user operation
  const { gasAndPaymasterAndData, isGasAndPaymasterAndDataLoading } =
    useQueryPaymasterGasAndPaymasterAndData({
      sender: address as Address,
      chainId: debouncedUserOperation?.chainId,
      nonce: debouncedUserOperation?.nonce,
      initCode: debouncedUserOperation?.initCode,
      callData: debouncedUserOperation?.callData,
      callGasLimit: debouncedUserOperation?.callGasLimit,
      preVerificationGas: debouncedUserOperation?.preVerificationGas,
      verificationGasLimit: debouncedUserOperation?.verificationGasLimit,
      maxFeePerGas: debouncedUserOperation?.maxFeePerGas,
      maxPriorityFeePerGas: debouncedUserOperation?.maxPriorityFeePerGas,
    });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  // Construct the updated user operation
  const finalizedUserOperation: Omit<
    UserOperation,
    "hash" | "signature"
  > | null = useMemo(() => {
    if (
      !debouncedUserOperation?.sender ||
      !debouncedUserOperation?.chainId ||
      !debouncedUserOperation?.initCode ||
      typeof debouncedUserOperation?.nonce === "undefined" ||
      debouncedUserOperation?.nonce === null ||
      !debouncedUserOperation?.callData ||
      !debouncedUserOperation?.maxFeePerGas ||
      !debouncedUserOperation?.maxPriorityFeePerGas ||
      !debouncedUserOperation?.callGasLimit ||
      !debouncedUserOperation?.preVerificationGas ||
      !debouncedUserOperation?.verificationGasLimit ||
      !gasAndPaymasterAndData
    ) {
      return null;
    }

    return {
      sender: debouncedUserOperation?.sender,
      chainId: debouncedUserOperation?.chainId,
      initCode: debouncedUserOperation?.initCode,
      nonce: debouncedUserOperation?.nonce,
      callData: debouncedUserOperation?.callData,
      maxFeePerGas: debouncedUserOperation?.maxFeePerGas,
      maxPriorityFeePerGas: debouncedUserOperation?.maxPriorityFeePerGas,
      callGasLimit: debouncedUserOperation?.callGasLimit,
      preVerificationGas: debouncedUserOperation?.preVerificationGas,
      verificationGasLimit: debouncedUserOperation?.verificationGasLimit,
      paymasterAndData: gasAndPaymasterAndData?.paymasterAndData ?? "0x",
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Only paymaster and data is required to compute the gas limits and paymaster
    // The rest of the values are dependencies of the paymaster and data
    // As it is the final layer of computation
    gasAndPaymasterAndData,
  ]);
  console.info("finalizedUserOperation", finalizedUserOperation);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const fetchHashAndUpdateOperation = async () => {
      if (!finalizedUserOperation) {
        return;
      }

      // Don't update the user operation if the below required fields are empty
      if (
        finalizedUserOperation.callGasLimit === 0n ||
        finalizedUserOperation.verificationGasLimit === 0n ||
        finalizedUserOperation.preVerificationGas === 0n ||
        finalizedUserOperation.maxFeePerGas === 0n ||
        finalizedUserOperation.maxPriorityFeePerGas === 0n ||
        finalizedUserOperation.paymasterAndData === "0x"
      ) {
        return;
      }

      // Add the dummy signature to get the hash for the user operation
      const userOperation = {
        ...finalizedUserOperation,
        signature: "0x",
      };

      // Get the hash for the user operation w/ the corresponding entry point
      const hash = await getUserOperationHash({
        userOperation: userOperation as PermissionlessUserOperation<"v0.6">,
        chainId: Number(finalizedUserOperation.chainId) as number,
        entryPoint: WALLET_FACTORY_ENTRYPOINT_MAPPING[
          findContractAddressByAddress(wallet?.factory_address as Address)!
        ] as typeof ENTRYPOINT_ADDRESS_V06,
      });

      // Don't update the user operation if the hash is same as the previous one
      if (hash === userOperationWithHash?.hash) {
        return;
      }

      // Update the user operation hash state for computation
      setUserOperationWithHash({
        ...userOperation,
        hash: hash,
      });
    };

    // Run the async function
    fetchHashAndUpdateOperation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Sole dependency is the updated user operation w/ paymaster and data values
    finalizedUserOperation,
  ]);

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isTransactionFetcherLoading = useMemo(() => {
    return (
      isDebouncingUserOperation ||
      isUserOperationEstimateFeesPerGasLoading ||
      isUserOperationEstimateGasLoading ||
      isGasAndPaymasterAndDataLoading
    );
  }, [
    isDebouncingUserOperation,
    isUserOperationEstimateFeesPerGasLoading,
    isUserOperationEstimateGasLoading,
    isGasAndPaymasterAndDataLoading,
  ]);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    setIsFormLoading(isTransactionFetcherLoading);
  }, [isTransactionFetcherLoading]);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // Sync `targetUserOperation` to the store
  useEffect(() => {
    if (
      !targetUserOperation?.chainId ||
      typeof targetUserOperation?.nonce === "undefined" ||
      targetUserOperation?.nonce === null
    ) {
      return;
    }
    setPartialUserOperationByChainIdAndNonce(
      targetUserOperation?.chainId,
      targetUserOperation?.nonce,
      targetUserOperation,
    );
  }, [
    targetUserOperation?.chainId,
    setUserOperationByChainIdAndNonce,
    targetUserOperation,
  ]);

  // Sync `debouncedUserOperation` to the store
  useEffect(() => {
    if (
      !debouncedUserOperation?.chainId ||
      typeof debouncedUserOperation?.nonce === "undefined" ||
      debouncedUserOperation?.nonce === null
    ) {
      return;
    }

    setPartialUserOperationByChainIdAndNonce(
      debouncedUserOperation?.chainId,
      debouncedUserOperation?.nonce,
      debouncedUserOperation,
    );
  }, [
    debouncedUserOperation?.chainId,
    setUserOperationByChainIdAndNonce,
    debouncedUserOperation,
  ]);

  // Sync `userOperationWithHash` to the store
  useEffect(() => {
    if (!userOperationWithHash) {
      return;
    }
    setUserOperationByChainIdAndNonce(
      userOperationWithHash?.chainId,
      userOperationWithHash?.nonce,
      userOperationWithHash,
    );
  }, [
    userOperationWithHash?.chainId,
    setUserOperationByChainIdAndNonce,
    userOperationWithHash,
  ]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return null;
};
