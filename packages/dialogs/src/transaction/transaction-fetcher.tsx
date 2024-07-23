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
import {
  useDebouncedValue,
  useProxyImplementationAddress,
} from "@lightdotso/hooks";
import {
  useQueryConfiguration,
  useQueryPaymasterGasAndPaymasterAndData,
  useQuerySimulation,
  useQueryUserOperationNonce,
  useQueryUserOperations,
  useQueryWallet,
  useQueryUserOperationEstimateGas,
  useQueryUserOperationEstimateFeesPerGas,
} from "@lightdotso/query";
import { userOperation, type UserOperation } from "@lightdotso/schemas";
import { calculateInitCode } from "@lightdotso/sequence";
import { useFormRef, useUserOperations } from "@lightdotso/stores";
import { findContractAddressByAddress } from "@lightdotso/utils";
import {
  useReadEntryPointGetNonce,
  useReadLightWalletImageHash,
} from "@lightdotso/wagmi";
import { zodResolver } from "@hookform/resolvers/zod";
import { getUserOperationHash } from "permissionless";
import type {
  UserOperation as PermissionlessUserOperation,
  ENTRYPOINT_ADDRESS_V06,
} from "permissionless";
import { type FC, useMemo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { type Hex, type Address } from "viem";

// -----------------------------------------------------------------------------
// Schema
// -----------------------------------------------------------------------------

const userOperationFormSchema = userOperation;

type UserOperationFormValues = UserOperation;

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
  // Hooks
  // ---------------------------------------------------------------------------

  // Get the implementation address
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const implAddress = useProxyImplementationAddress({
    address: address as Address,
    chainId: Number(initialUserOperation.chainId),
  });

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
  const {
    userOperations: executedUserOperations,
    // isUserOperationsLoading: isExecutedUserOperationsLoading,
  } = useQueryUserOperations({
    address: address as Address,
    status: "executed",
    offset: 0,
    limit: 1,
    order: "asc",
    is_testnet: true,
    chain_id: Number(initialUserOperation.chainId) as number,
  });

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  // Create the form
  const form = useForm<UserOperationFormValues>({
    mode: "all",
    reValidateMode: "onBlur",
    resolver: zodResolver(userOperationFormSchema),
    defaultValues: initialUserOperation,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formValues = form.watch();

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
          ? BigInt(userOperationNonce.nonce)
          : undefined;

    // Get the init code from the executed user operations or the partial user operation
    const updatedInitCode =
      executedUserOperations &&
      executedUserOperations?.length < 1 &&
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
        : updatedInitCode !== undefined
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
    // Should recompute if the executed user operations change, for init code
    executedUserOperations,
    // Should recompute if the entry point nonce changes
    entryPointNonce,
    // Should recompute if the user operation nonce changes
    userOperationNonce,
  ]);

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
    chainId: Number(targetUserOperation.chainId),
    callData: targetUserOperation.callData as Hex,
  });

  // Gets the gas estimate for the user operation
  const {
    callGasLimit,
    preVerificationGas,
    verificationGasLimit,
    isUserOperationEstimateGasLoading,
  } = useQueryUserOperationEstimateGas({
    sender: address as Address,
    chainId: targetUserOperation.chainId,
    nonce: targetUserOperation.nonce,
    initCode: targetUserOperation.initCode,
    callData: targetUserOperation.callData,
  });

  // Gets the simulation for the user operation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { simulation } = useQuerySimulation({
    sender: address as Address,
    nonce: Number(targetUserOperation.nonce),
    chain_id: Number(targetUserOperation.chainId),
    call_data: targetUserOperation.callData as Hex,
    init_code: targetUserOperation.initCode as Hex,
  });

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
      !targetUserOperation.sender ||
      !targetUserOperation.chainId ||
      !targetUserOperation.initCode ||
      !targetUserOperation.nonce ||
      !targetUserOperation.callData ||
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

    return {
      sender: targetUserOperation.sender,
      chainId: targetUserOperation.chainId,
      initCode: targetUserOperation.initCode,
      nonce: targetUserOperation.nonce,
      callData: targetUserOperation.callData,
      maxFeePerGas: maxFeePerGas,
      maxPriorityFeePerGas: maxPriorityFeePerGas,
      callGasLimit: callGasLimit,
      preVerificationGas: preVerificationGas,
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

  // ---------------------------------------------------------------------------
  // Debounce
  // ---------------------------------------------------------------------------

  const debouncedUserOperation = useDebouncedValue(updatedUserOperation, 300);

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
      !debouncedUserOperation?.nonce ||
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

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // If the implementation address is available and is the version 0.1.0 and is after index 0
  // Remove the user operation itself
  // useEffect(() => {
  //   if (
  //     userOperationIndex > 0 &&
  //     implAddress &&
  //     implAddress === CONTRACT_ADDRESSES["v0.1.0 Implementation"]
  //   ) {
  //     // Remove the user operation from the list
  //     // setUserOperations(prev => {
  //     //   const next = [...prev];
  //     //   next.splice(userOperationIndex, 1);
  //     //   return next;
  //     // });

  //     // Set the disabled state
  //     setIsDisabled(true);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [implAddress, userOperationIndex]);

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

      // IF the fields differ, update the user operation
      // if (
      //   targetUserOperation.callGasLimit !==
      //     finalizedUserOperation.callGasLimit ||
      //   targetUserOperation.verificationGasLimit !==
      //     finalizedUserOperation.verificationGasLimit ||
      //   targetUserOperation.preVerificationGas !==
      //     finalizedUserOperation.preVerificationGas ||
      //   targetUserOperation.maxFeePerGas !==
      //     finalizedUserOperation.maxFeePerGas ||
      //   targetUserOperation.maxPriorityFeePerGas !==
      //     finalizedUserOperation.maxPriorityFeePerGas
      // ) {
      //   setUserOperations(prev => {
      //     const next = [...prev];
      //     if (next[userOperationIndex]) {
      //       next[userOperationIndex] = finalizedUserOperation;
      //     }
      //     return next;
      //   });
      // }

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

      // If the hash field differs, update the user operation
      // if (userOperationWithHash?.hash !== hash) {
      //   setUserOperations(prev => {
      //     const next = [...prev];
      //     if (next[userOperationIndex]) {
      //       next[userOperationIndex] = {
      //         ...finalizedUserOperation,
      //         hash,
      //       };
      //     }
      //     return next;
      //   });
      // }

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
      isUserOperationEstimateFeesPerGasLoading ||
      isUserOperationEstimateGasLoading ||
      isGasAndPaymasterAndDataLoading
    );
  }, [
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
    if (!targetUserOperation.chainId || !targetUserOperation.nonce) {
      return;
    }
    setPartialUserOperationByChainIdAndNonce(
      targetUserOperation.chainId,
      targetUserOperation.nonce,
      targetUserOperation,
    );
  }, [
    targetUserOperation.chainId,
    setUserOperationByChainIdAndNonce,
    targetUserOperation,
  ]);

  // Sync `debouncedUserOperation` to the store
  useEffect(() => {
    if (!debouncedUserOperation?.chainId || !debouncedUserOperation?.nonce) {
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
