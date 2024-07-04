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

import {
  CONTRACT_ADDRESSES,
  WALLET_FACTORY_ENTRYPOINT_MAPPING,
} from "@lightdotso/const";
import {
  useDebouncedValue,
  useProxyImplementationAddress,
  useUserOperationEstimateGas,
  useUserOperationFeePerGas,
} from "@lightdotso/hooks";
import {
  useQueryConfiguration,
  useQueryPaymasterGasAndPaymasterAndData,
  useQuerySimulation,
  useQueryUserOperationNonce,
  useQueryUserOperations,
  useQueryWallet,
} from "@lightdotso/query";
import { userOperation, type UserOperation } from "@lightdotso/schemas";
import { calculateInitCode } from "@lightdotso/sequence";
import { useFormRef, useUserOperations } from "@lightdotso/stores";
import type { UserOperationDetailsItem } from "@lightdotso/stores";
import {
  findContractAddressByAddress,
  getChainById,
  shortenAddress,
  shortenBytes32,
} from "@lightdotso/utils";
import { useReadLightWalletImageHash } from "@lightdotso/wagmi";
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
  userOperationIndex: number;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TransactionFetcher: FC<TransactionFetcherProps> = ({
  address,
  initialUserOperation,
  userOperationIndex = 0,
}) => {
  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [isDisabled, setIsDisabled] = useState(false);
  const [userOperationWithHash, setUserOperationWithHash] =
    useState<UserOperation>();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { setIsFormDisabled, setIsFormLoading } = useFormRef();
  const {
    setInternalUserOperationByChainId,
    setUserOperationDetails,
    // setUserOperationDevInfo,
  } = useUserOperations();

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  // Get the implementation address
  const implAddress = useProxyImplementationAddress({
    address: address as Address,
    chainId: Number(initialUserOperation.chainId),
  });

  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  // Get the image hash for the light wallet
  const { data: imageHash } = useReadLightWalletImageHash({
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
  const { configuration } = useQueryConfiguration({
    address: address as Address,
    image_hash: imageHash,
  });

  // Gets the user operation nonce
  const { userOperationNonce, isUserOperationNonceLoading } =
    useQueryUserOperationNonce({
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
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  // Turns the partial userOperation into an userOperation w/ default values
  // Should not change from the initial user operation
  const targetUserOperation: Omit<
    UserOperation,
    "hash" | "paymasterAndData" | "signature"
  > = useMemo(() => {
    // Get the minimum nonce from the user operation nonce and the partial user operation
    const updatedMinimumNonce =
      userOperationNonce && !isUserOperationNonceLoading
        ? // If the initial user operation is empty,
          // Or the initial user operation nonce is smaller than the user operation nonce for the chain
          // Then, use the user operation nonce
          !initialUserOperation.nonce ||
          (initialUserOperation.nonce &&
            userOperationNonce?.nonce > initialUserOperation?.nonce)
          ? BigInt(userOperationNonce?.nonce)
          : initialUserOperation.nonce
        : initialUserOperation.nonce;

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
        : initialUserOperation.initCode;

    // Return the user operation
    return {
      sender: initialUserOperation?.sender ?? address,
      chainId: initialUserOperation?.chainId ?? BigInt(0),
      initCode: updatedInitCode ?? "0x",
      nonce: updatedMinimumNonce ?? BigInt(0),
      callData: initialUserOperation?.callData ?? "0x",
      callGasLimit: initialUserOperation?.callGasLimit ?? BigInt(0),
      verificationGasLimit:
        initialUserOperation?.verificationGasLimit ?? BigInt(0),
      preVerificationGas: initialUserOperation?.preVerificationGas ?? BigInt(0),
      maxFeePerGas: initialUserOperation?.maxFeePerGas ?? BigInt(0),
      maxPriorityFeePerGas:
        initialUserOperation?.maxPriorityFeePerGas ?? BigInt(0),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // The wallet is required to compute the init code
    wallet,
    // The genesis configuration is static
    genesisConfiguration,
    // Should recompute if the executed user operations change, for init code
    executedUserOperations,
    // Should recompute if the user operation nonce changes
    userOperationNonce,
  ]);

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  // Get the gas estimate for the user operation
  const { maxFeePerGas, maxPriorityFeePerGas } = useUserOperationFeePerGas({
    address: address as Address,
    chainId: targetUserOperation.chainId,
    callData: targetUserOperation.callData as Hex,
  });

  // Gets the gas estimate for the user operation
  const {
    callGasLimit,
    preVerificationGas,
    verificationGasLimit,
    isUserOperationEstimateGasLoading,
  } = useUserOperationEstimateGas({
    address: address as Address,
    targetUserOperation: {
      chainId: targetUserOperation.chainId,
      nonce: targetUserOperation.nonce,
      initCode: targetUserOperation.initCode,
      callData: targetUserOperation.callData,
    },
  });

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

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
  // Query
  // ---------------------------------------------------------------------------

  // Get the paymaster and data from the target user operation
  const { gasAndPaymasterAndData, isGasAndPaymasterAndDataLoading } =
    useQueryPaymasterGasAndPaymasterAndData({
      sender: address as Address,
      chainId: targetUserOperation.chainId,
      nonce: targetUserOperation.nonce,
      initCode: targetUserOperation.initCode,
      callData: targetUserOperation.callData,
      callGasLimit: callGasLimit,
      preVerificationGas: preVerificationGas,
      verificationGasLimit: verificationGasLimit,
      maxFeePerGas: maxFeePerGas,
      maxPriorityFeePerGas: maxPriorityFeePerGas,
    });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  // Construct the updated user operation
  const updatedUserOperation: Omit<UserOperation, "hash" | "signature"> =
    useMemo(() => {
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
        verificationGasLimit: verificationGasLimit,
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
  useEffect(() => {
    if (
      userOperationIndex > 0 &&
      implAddress &&
      implAddress === CONTRACT_ADDRESSES["v0.1.0 Implementation"]
    ) {
      // Remove the user operation from the list
      // setUserOperations(prev => {
      //   const next = [...prev];
      //   next.splice(userOperationIndex, 1);
      //   return next;
      // });

      // Set the disabled state
      setIsDisabled(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [implAddress, userOperationIndex]);

  useEffect(() => {
    const fetchHashAndUpdateOperation = async () => {
      // Don't update the user operation if the below required fields are empty
      if (
        updatedUserOperation.callGasLimit === 0n ||
        updatedUserOperation.verificationGasLimit === 0n ||
        updatedUserOperation.preVerificationGas === 0n ||
        updatedUserOperation.maxFeePerGas === 0n ||
        updatedUserOperation.maxPriorityFeePerGas === 0n ||
        updatedUserOperation.paymasterAndData === "0x"
      ) {
        return;
      }

      // IF the fields differ, update the user operation
      // if (
      //   targetUserOperation.callGasLimit !==
      //     updatedUserOperation.callGasLimit ||
      //   targetUserOperation.verificationGasLimit !==
      //     updatedUserOperation.verificationGasLimit ||
      //   targetUserOperation.preVerificationGas !==
      //     updatedUserOperation.preVerificationGas ||
      //   targetUserOperation.maxFeePerGas !==
      //     updatedUserOperation.maxFeePerGas ||
      //   targetUserOperation.maxPriorityFeePerGas !==
      //     updatedUserOperation.maxPriorityFeePerGas
      // ) {
      //   setUserOperations(prev => {
      //     const next = [...prev];
      //     if (next[userOperationIndex]) {
      //       next[userOperationIndex] = updatedUserOperation;
      //     }
      //     return next;
      //   });
      // }

      // Add the dummy signature to get the hash for the user operation
      const userOperation = {
        ...updatedUserOperation,
        signature: "0x",
      };

      // Get the hash for the user operation w/ the corresponding entry point
      const hash = await getUserOperationHash({
        userOperation: userOperation as PermissionlessUserOperation<"v0.6">,
        chainId: Number(updatedUserOperation.chainId) as number,
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
      //         ...updatedUserOperation,
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
    updatedUserOperation,
  ]);

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isTransactionFetcherLoading = useMemo(() => {
    return isUserOperationEstimateGasLoading || isGasAndPaymasterAndDataLoading;
  }, [isUserOperationEstimateGasLoading, isGasAndPaymasterAndDataLoading]);

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const debouncedUserOperationWithHash = useDebouncedValue(
    userOperationWithHash,
    300,
  );

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // Sync `userOperationWithHash` to the store
  useEffect(() => {
    if (!debouncedUserOperationWithHash) {
      return;
    }

    setInternalUserOperationByChainId(
      Number(targetUserOperation.chainId),
      debouncedUserOperationWithHash,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Debounced user operation with hash is the only dependency
    debouncedUserOperationWithHash,
  ]);

  useEffect(() => {
    setIsFormDisabled(isDisabled);
  }, [isDisabled]);

  useEffect(() => {
    setIsFormLoading(isTransactionFetcherLoading);
  }, [isTransactionFetcherLoading]);

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const chain = useMemo(
    () => getChainById(Number(targetUserOperation.chainId)),
    [targetUserOperation.chainId],
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const userOperationDetails = useMemo(() => {
    const items: UserOperationDetailsItem[] = [
      { title: "Nonce", value: Number(updatedUserOperation.nonce) },
      {
        title: "Sender",
        value: shortenAddress(updatedUserOperation.sender),
      },
      {
        title: "Threshold",
        // eslint-disable-next-line no-unsafe-optional-chaining, @typescript-eslint/no-non-null-asserted-optional-chain
        value: configuration?.threshold!,
      },
      { title: "Chain", value: chain?.name },
    ];

    if (updatedUserOperation?.callGasLimit) {
      items.push({
        title: "Call Gas Limit",
        value: updatedUserOperation.callGasLimit.toLocaleString(),
      });
    }

    if (updatedUserOperation?.preVerificationGas) {
      items.push({
        title: "Pre-Verification Gas",
        value: updatedUserOperation.preVerificationGas.toLocaleString(),
      });
    }

    if (updatedUserOperation?.verificationGasLimit) {
      items.push({
        title: "Verification Gas Limit",
        value: updatedUserOperation.verificationGasLimit.toLocaleString(),
      });
    }

    if (updatedUserOperation?.maxFeePerGas) {
      items.push({
        title: "Max Fee Per Gas",
        value: updatedUserOperation.maxFeePerGas.toLocaleString(),
      });
    }

    if (updatedUserOperation.maxPriorityFeePerGas) {
      items.push({
        title: "Max Priority Fee Per Gas",
        value: updatedUserOperation.maxPriorityFeePerGas.toLocaleString(),
      });
    }

    if (userOperationWithHash?.hash) {
      items.push({
        title: "Hash",
        value: shortenBytes32(userOperationWithHash.hash),
      });
    }

    return items;
  }, [
    chain,
    configuration?.threshold,
    updatedUserOperation.nonce,
    updatedUserOperation.sender,
    updatedUserOperation?.callGasLimit,
    updatedUserOperation?.preVerificationGas,
    updatedUserOperation?.verificationGasLimit,
    updatedUserOperation?.maxFeePerGas,
    updatedUserOperation?.maxPriorityFeePerGas,
    userOperationWithHash?.hash,
  ]);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // On mount, set the user operation details
  useEffect(() => {
    setUserOperationDetails(
      Number(targetUserOperation.chainId),
      userOperationDetails,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync the user operation details
  useEffect(() => {
    if (!targetUserOperation || isDisabled) {
      return;
    }

    setUserOperationDetails(
      Number(targetUserOperation.chainId),
      userOperationDetails,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userOperationDetails]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return null;
};
