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
import type { ConfigurationData, WalletData } from "@lightdotso/data";
import {
  useDebouncedValue,
  useProxyImplementationAddress,
} from "@lightdotso/hooks";
import { useUserOperationsQueryState } from "@lightdotso/nuqs";
import {
  useQueryConfiguration,
  useQueryEstimateUserOperationGas,
  useQueryPaymasterGasAndPaymasterAndData,
  useQuerySimulation,
  useQueryUserOperationNonce,
  useQueryUserOperations,
  useQueryWalletBilling,
} from "@lightdotso/query";
import { userOperation, type UserOperation } from "@lightdotso/schemas";
import { calculateInitCode } from "@lightdotso/sequence";
import { useFormRef, useUserOperations } from "@lightdotso/stores";
import type {
  UserOperationDevInfo,
  UserOperationDetailsItem,
} from "@lightdotso/stores";
import {
  findContractAddressByAddress,
  getChainById,
  shortenAddress,
  shortenBytes32,
} from "@lightdotso/utils";
import {
  useEstimateFeesPerGas,
  useEstimateGas,
  useEstimateMaxPriorityFeePerGas,
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
import { type Hex, type Address, fromHex } from "viem";

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
  wallet: WalletData;
  genesisConfiguration: ConfigurationData;
  initialUserOperation: Omit<
    UserOperation,
    | "hash"
    | "signature"
    | "paymasterAndData"
    | "maxFeePerGas"
    | "maxPriorityFeePerGas"
    | "callGasLimit"
    | "preVerificationGas"
    | "verificationGasLimit"
  >;
  userOperationIndex: number;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TransactionFetcher: FC<TransactionFetcherProps> = ({
  address,
  wallet,
  genesisConfiguration,
  initialUserOperation,
  userOperationIndex = 0,
}) => {
  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [isDisabled, setIsDisabled] = useState(false);
  const [userOperationWithHash, setUserOperationWithHash] =
    useState<UserOperation>();
  console.info("userOperationWithHash", userOperationWithHash);

  // ---------------------------------------------------------------------------
  // Query State Hooks
  // ---------------------------------------------------------------------------

  const [userOperations, setUserOperations] = useUserOperationsQueryState();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const {
    // setIsFormDisabled,
    setIsFormLoading,
  } = useFormRef();
  const {
    setInternalUserOperationByChainId,
    setUserOperationDetails,
    setUserOperationDevInfo,
    setUserOperationSimulation,
  } = useUserOperations();

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  // Get the implementation address
  const implAddress = useProxyImplementationAddress({
    address: address,
    chainId: Number(initialUserOperation.chainId),
  });

  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  // Get the image hash for the light wallet
  const { data: imageHash } = useReadLightWalletImageHash({
    address: address,
    chainId: Number(initialUserOperation.chainId),
  });

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  // Also, get the wallet billing
  const { walletBilling, isWalletBillingLoading } = useQueryWalletBilling({
    address,
  });

  // Gets the configuration for the chain w/ the image hash
  const { configuration } = useQueryConfiguration({
    address: address,
    image_hash: imageHash,
  });

  // Gets the user operation nonce
  const { userOperationNonce, isUserOperationNonceLoading } =
    useQueryUserOperationNonce({
      address: address,
      chain_id: Number(initialUserOperation.chainId),
    });

  // Gets the history of user operations
  const {
    userOperations: executedUserOperations,
    isUserOperationsLoading: isExecutedUserOperationsLoading,
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
  const targetUserOperation: Omit<
    UserOperation,
    "hash" | "paymasterAndData" | "signature"
  > = useMemo(() => {
    // Get the user operation at the index, fallback to the initial user operation
    const partialUserOperation =
      userOperations.length > 0
        ? { ...userOperations[userOperationIndex], ...initialUserOperation }
        : { ...initialUserOperation };

    // Get the minimum nonce from the user operation nonce and the partial user operation
    const updatedMinimumNonce =
      userOperationNonce && !isUserOperationNonceLoading
        ? userOperationNonce?.nonce > partialUserOperation.nonce
          ? BigInt(userOperationNonce?.nonce)
          : partialUserOperation.nonce
        : partialUserOperation.nonce;

    // Get the init code from the executed user operations or the partial user operation
    const updatedInitCode =
      executedUserOperations && executedUserOperations?.length < 1
        ? calculateInitCode(
            wallet.factory_address as Address,
            // Compute w/ the genesis configuration image hash
            genesisConfiguration.image_hash as Hex,
            wallet.salt as Hex,
          )
        : partialUserOperation.initCode;

    // Return the user operation
    return {
      sender: partialUserOperation?.sender ?? address,
      chainId: partialUserOperation?.chainId ?? BigInt(0),
      initCode: updatedInitCode ?? "0x",
      nonce: updatedMinimumNonce ?? BigInt(0),
      callData: partialUserOperation?.callData ?? "0x",
      callGasLimit: partialUserOperation?.callGasLimit ?? BigInt(0),
      verificationGasLimit:
        partialUserOperation?.verificationGasLimit ?? BigInt(0),
      preVerificationGas: partialUserOperation?.preVerificationGas ?? BigInt(0),
      maxFeePerGas: partialUserOperation?.maxFeePerGas ?? BigInt(0),
      maxPriorityFeePerGas:
        partialUserOperation?.maxPriorityFeePerGas ?? BigInt(0),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  // Gets the simulation for the user operation
  const { simulation } = useQuerySimulation({
    sender: address as Address,
    nonce: Number(targetUserOperation.nonce),
    chain_id: Number(targetUserOperation.chainId),
    call_data: targetUserOperation.callData as Hex,
    init_code: targetUserOperation.initCode as Hex,
  });

  // Gets the gas estimate for the user operation
  const {
    estimateUserOperationGasData,
    isEstimateUserOperationGasDataLoading,
    estimateUserOperationGasDataError,
  } = useQueryEstimateUserOperationGas({
    sender: address as Address,
    chainId: targetUserOperation.chainId,
    nonce: targetUserOperation.nonce,
    initCode: targetUserOperation.initCode,
    callData: targetUserOperation.callData,
  });

  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  // Get the gas estimate for the user operation
  const { data: estimateGas, error: estimateGasError } = useEstimateGas({
    chainId: Number(targetUserOperation.chainId ?? 1),
    account: address as Address,
    data: targetUserOperation.callData as Hex,
    to: WALLET_FACTORY_ENTRYPOINT_MAPPING[
      findContractAddressByAddress(wallet.factory_address as Address)!
    ],
  });

  // Get the max fee per gas, fallbacks to mainnet
  const { data: feesPerGas, error: estimateFeesPerGasError } =
    useEstimateFeesPerGas({
      chainId: Number(targetUserOperation.chainId ?? 1),
    });

  // Get the max priority fee per gas, fallbacks to mainnet
  const {
    data: maxPriorityFeePerGas,
    error: estimateMaxPriorityFeePerGasError,
  } = useEstimateMaxPriorityFeePerGas({
    chainId: Number(targetUserOperation.chainId ?? 1),
  });

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  // Get the paymaster and data from the target user operation
  const { paymasterAndData, isPaymasterAndDataLoading, paymasterAndDataError } =
    useQueryPaymasterGasAndPaymasterAndData({
      sender: address as Address,
      chainId: targetUserOperation.chainId,
      nonce: targetUserOperation.nonce,
      initCode: targetUserOperation.initCode,
      callData: targetUserOperation.callData,
      callGasLimit: estimateUserOperationGasData?.callGasLimit
        ? fromHex(estimateUserOperationGasData?.callGasLimit as Hex, {
            to: "bigint",
          })
        : BigInt(0),
      preVerificationGas: estimateUserOperationGasData?.preVerificationGas
        ? fromHex(estimateUserOperationGasData?.preVerificationGas as Hex, {
            to: "bigint",
          })
        : BigInt(0),
      verificationGasLimit: estimateUserOperationGasData?.verificationGasLimit
        ? fromHex(estimateUserOperationGasData?.verificationGasLimit as Hex, {
            to: "bigint",
          })
        : BigInt(0),
      maxFeePerGas:
        feesPerGas?.maxFeePerGas ?? targetUserOperation.maxFeePerGas,
      maxPriorityFeePerGas:
        // If the chain is Celo, `maxFeePerGas` is the same as `maxPriorityFeePerGas`
        targetUserOperation.chainId === BigInt(42220)
          ? feesPerGas?.maxFeePerGas ?? targetUserOperation.maxFeePerGas
          : // Fallback to 1 if the maxPriorityFeePerGas is 0 from the RPC
            maxPriorityFeePerGas === BigInt(0)
            ? BigInt(1)
            : maxPriorityFeePerGas ?? targetUserOperation.maxPriorityFeePerGas,
    });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  // Construct the updated user operation
  const updatedUserOperation: Omit<UserOperation, "hash" | "signature"> =
    useMemo(() => {
      return {
        // The default values
        sender: targetUserOperation.sender,
        chainId: targetUserOperation.chainId,
        initCode: targetUserOperation.initCode,
        nonce: targetUserOperation.nonce,
        callData: targetUserOperation.callData,
        // The target values to fill in
        maxFeePerGas: paymasterAndData?.maxFeePerGas
          ? fromHex(paymasterAndData.maxFeePerGas as Hex, { to: "bigint" })
          : BigInt(0),
        maxPriorityFeePerGas: paymasterAndData?.maxPriorityFeePerGas
          ? fromHex(paymasterAndData.maxPriorityFeePerGas as Hex, {
              to: "bigint",
            })
          : BigInt(0),
        callGasLimit: paymasterAndData?.callGasLimit
          ? fromHex(paymasterAndData.callGasLimit as Hex, { to: "bigint" })
          : BigInt(0),
        verificationGasLimit: paymasterAndData?.verificationGasLimit
          ? fromHex(paymasterAndData.verificationGasLimit as Hex, {
              to: "bigint",
            })
          : BigInt(0),
        preVerificationGas: paymasterAndData?.preVerificationGas
          ? fromHex(paymasterAndData.preVerificationGas as Hex, {
              to: "bigint",
            })
          : BigInt(0),
        // The core paymaster and data values
        paymasterAndData: paymasterAndData?.paymasterAndData ?? "0x",
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      // The target user operation is required to compute the default fields
      targetUserOperation,
      // Paymaster and data is required to compute the gas limits and paymaster
      paymasterAndData,
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
          findContractAddressByAddress(wallet.factory_address as Address)!
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
        hash,
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
    return isEstimateUserOperationGasDataLoading || isPaymasterAndDataLoading;
  }, [isEstimateUserOperationGasDataLoading, isPaymasterAndDataLoading]);

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const debouncedUserOperationWithHash = useDebouncedValue(
    userOperationWithHash,
    300,
  );
  console.info(
    "debouncedUserOperationWithHash",
    debouncedUserOperationWithHash,
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

  // useEffect(() => {
  //   setIsFormDisabled(isDisabled);
  // }, [isDisabled, setIsFormDisabled]);

  useEffect(() => {
    setIsFormLoading(isTransactionFetcherLoading);
  }, [isTransactionFetcherLoading, setIsFormLoading]);

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
      { title: "Nonce", value: Number(targetUserOperation.nonce) },
      { title: "Sender", value: shortenAddress(targetUserOperation.sender) },
      {
        title: "Threshold",
        value: configuration?.threshold!,
      },
      { title: "Chain", value: chain?.name },
    ];

    if (estimateUserOperationGasData?.callGasLimit) {
      items.push({
        title: "Call Gas Limit",
        value: fromHex(estimateUserOperationGasData.callGasLimit as Hex, {
          to: "bigint",
        }).toLocaleString(),
      });
    }

    if (estimateUserOperationGasData?.preVerificationGas) {
      items.push({
        title: "Pre-Verification Gas",
        value: fromHex(estimateUserOperationGasData.preVerificationGas as Hex, {
          to: "bigint",
        }).toLocaleString(),
      });
    }

    if (estimateUserOperationGasData?.verificationGasLimit) {
      items.push({
        title: "Verification Gas Limit",
        value: fromHex(
          estimateUserOperationGasData.verificationGasLimit as Hex,
          { to: "bigint" },
        ).toLocaleString(),
      });
    }

    if (feesPerGas?.maxFeePerGas) {
      items.push({
        title: "Max Fee Per Gas",
        value: feesPerGas.maxFeePerGas.toLocaleString(),
      });
    }

    if (maxPriorityFeePerGas) {
      items.push({
        title: "Max Priority Fee Per Gas",
        value: maxPriorityFeePerGas.toLocaleString(),
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
    targetUserOperation.nonce,
    targetUserOperation.sender,
    userOperationWithHash?.hash,
    estimateUserOperationGasData?.callGasLimit,
    estimateUserOperationGasData?.preVerificationGas,
    estimateUserOperationGasData?.verificationGasLimit,
    feesPerGas?.maxFeePerGas,
    maxPriorityFeePerGas,
  ]);

  // ---------------------------------------------------------------------------
  // Local Variables
  // ---------------------------------------------------------------------------

  const userOperationDevInfo: UserOperationDevInfo[] = [
    { title: "targetUserOperation", data: targetUserOperation },
    { title: "updatedUserOperation", data: updatedUserOperation },
    { title: "userOperationWithHash", data: userOperationWithHash },
    {
      title: "estimateUserOperationGasData",
      data: estimateUserOperationGasData,
    },
    {
      title: "feesPerGas",
      data: feesPerGas,
    },
    {
      title: "estimateGas",
      data: estimateGas,
    },
    {
      title: "maxPriorityFeePerGas",
      data: maxPriorityFeePerGas,
    },
    {
      title: "estimateGasError",
      data: estimateGasError,
    },
    {
      title: "estimateFeesPerGasError",
      data: estimateFeesPerGasError,
    },
    {
      title: "estimateMaxPriorityFeePerGasError",
      data: estimateMaxPriorityFeePerGasError,
    },
    {
      title: "estimateUserOperationGasDataError",
      data: estimateUserOperationGasDataError,
    },
    {
      title: "paymasterAndDataError",
      data: paymasterAndDataError,
    },
    {
      title: "configuration",
      data: configuration,
    },
    {
      title: "genesisConfiguration",
      data: genesisConfiguration,
    },
    {
      title: "configuration",
      data: configuration,
    },
    // {
    //   title: "decodedInitCode",
    //   data: decodedInitCode,
    // },
    // {
    //   title: "decodedCallData",
    //   data: decodedCallData,
    // },
    // {
    //   title: "subdigest",
    //   data: subdigest,
    // },
    {
      title: "paymasterAndData",
      data: paymasterAndData,
    },
    {
      title: "simulation",
      data: simulation,
    },
    {
      title: "userOperationNonce",
      data: userOperationNonce,
    },
    {
      title: "executedUserOperations",
      data: executedUserOperations,
    },
    {
      title: "walletBilling",
      data: walletBilling,
    },
    {
      title: "owners",
      data: configuration?.owners,
    },
    {
      title: "isEstimateUserOperationGasDataLoading",
      data: isEstimateUserOperationGasDataLoading,
    },
    {
      title: "isUserOperationNonceLoading",
      data: isUserOperationNonceLoading,
    },
    {
      title: "isExecutedUserOperationsLoading",
      data: isExecutedUserOperationsLoading,
    },
    {
      title: "isPaymasterAndDataLoading",
      data: isPaymasterAndDataLoading,
    },
    {
      title: "isTransactionFetcherLoading",
      data: isTransactionFetcherLoading,
    },
    // {
    //   title: "isValidUserOperations",
    //   data: isValidUserOperations,
    // },
    {
      title: "isWalletBillingLoading",
      data: isWalletBillingLoading,
    },
  ];

  // ---------------------------------------------------------------------------
  // Debounced Hooks
  // ---------------------------------------------------------------------------

  const debouncedUserOperationDetails = useDebouncedValue(
    userOperationDetails,
    3000,
  );

  const debouncedUserOperationDevInfo = useDebouncedValue(
    userOperationDevInfo,
    3000,
  );

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // Sync the user operation details
  useEffect(() => {
    if (!targetUserOperation || isDisabled) {
      return;
    }

    setUserOperationDetails(
      Number(targetUserOperation.chainId),
      debouncedUserOperationDetails,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedUserOperationDetails]);

  // Sync the user operation dev info
  useEffect(() => {
    if (isDisabled) {
      return;
    }

    setUserOperationDevInfo(
      Number(targetUserOperation.chainId),
      debouncedUserOperationDevInfo,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedUserOperationDevInfo]);

  // Sync the user operation simulation
  useEffect(() => {
    if (!simulation || isDisabled) {
      return;
    }

    setUserOperationSimulation(Number(targetUserOperation.chainId), simulation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulation]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return null;
};
