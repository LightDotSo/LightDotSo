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
import {
  useMutationUserOperationSend,
  useQueryPaymasterOperation,
} from "@lightdotso/query";
import {
  useReadLightVerifyingPaymasterGetHash,
  useReadLightVerifyingPaymasterSenderNonce,
} from "@lightdotso/wagmi";
import { useCallback, useState, useEffect } from "react";
import { toHex, fromHex, recoverMessageAddress } from "viem";
import type { Hex, Address } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type UserOperationSubmitProps = {
  address: Address;
  configuration: ConfigurationData;
  userOperation: UserOperationData;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const useUserOperationSubmit = ({
  // address,
  configuration,
  userOperation,
}: UserOperationSubmitProps) => {
  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [recoveredAddress, setRecoveredAddress] = useState<Address>();
  const [isLoading, setIsLoading] = useState(false);

  // ---------------------------------------------------------------------------
  // Local Variables
  // ---------------------------------------------------------------------------

  // Get the cumulative weight of all owners in the userOperation signatures array and check if it is greater than or equal to the threshold
  const isValid =
    userOperation.signatures.reduce((acc, signature) => {
      return (
        acc +
        ((configuration &&
          configuration.owners.find(owner => owner.id === signature?.owner_id)
            ?.weight) ||
          0)
      );
    }, 0) >= (configuration ? configuration.threshold : 0);

  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  const { data: paymasterHash } = useReadLightVerifyingPaymasterGetHash({
    address: userOperation.paymaster_and_data.slice(0, 42) as Address,
    chainId: userOperation.chain_id,
    args: [
      {
        sender: userOperation.sender as Address,
        nonce: BigInt(userOperation.nonce),
        initCode: userOperation.init_code as Hex,
        callData: userOperation.call_data as Hex,
        callGasLimit: BigInt(userOperation.call_gas_limit),
        verificationGasLimit: BigInt(userOperation.verification_gas_limit),
        preVerificationGas: BigInt(userOperation.pre_verification_gas),
        maxFeePerGas: BigInt(userOperation.max_fee_per_gas),
        maxPriorityFeePerGas: BigInt(userOperation.max_priority_fee_per_gas),
        paymasterAndData: userOperation.paymaster_and_data as Hex,
        signature: toHex(new Uint8Array([2])),
      },
      fromHex(
        `0x${userOperation.paymaster_and_data.slice(154, 162)}`,
        "number",
      ),
      fromHex(
        `0x${userOperation.paymaster_and_data.slice(162, 170)}`,
        "number",
      ),
    ],
  });

  const { data: paymasterNonce } = useReadLightVerifyingPaymasterSenderNonce({
    address: userOperation.paymaster_and_data.slice(0, 42) as Address,
    chainId: Number(userOperation.chain_id),
    args: [userOperation.sender as Address],
  });

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { paymasterOperation } = useQueryPaymasterOperation({
    address: userOperation.paymaster_and_data.slice(0, 42) as Address,
    chain_id: userOperation.chain_id,
    valid_after: fromHex(
      `0x${userOperation.paymaster_and_data.slice(162, 170)}`,
      "number",
    ),
  });

  const { userOperationSend } = useMutationUserOperationSend();

  // ---------------------------------------------------------------------------
  // Local Variables
  // ---------------------------------------------------------------------------

  const paymasterSignedMsg = `0x${userOperation.paymaster_and_data.slice(
    170,
  )}` as Hex;

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const recoverAddress = async () => {
      if (paymasterHash) {
        try {
          const address = await recoverMessageAddress({
            message: { raw: paymasterHash },
            signature: paymasterSignedMsg,
          });
          setRecoveredAddress(address);
        } catch (e) {
          console.error(e);
        }
      }
    };

    recoverAddress();
  }, [paymasterHash, paymasterSignedMsg]);

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  // A `useCallback` handler for confirming the operation
  const handleConfirm = useCallback(async () => {
    // Set loading state
    setIsLoading(true);

    await userOperationSend(userOperation);

    // Unset loading state
    setIsLoading(false);
  }, [userOperation, userOperation, setIsLoading]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return {
    isLoading,
    isValid,
    paymasterNonce,
    paymasterOperation,
    paymasterSignedMsg,
    recoveredAddress,
    handleConfirm,
  };
};
