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

import { Button, toast } from "@lightdotso/ui";
import { useSignMessage } from "wagmi";
import { serializeUserOperation } from "@/utils/userOp";
import type { UserOperation } from "permissionless";
import type { Address, Hex } from "viem";
import { subdigestOf } from "@lightdotso/solutions";
import { useEffect, useMemo } from "react";
import { createUserOperation } from "@lightdotso/client";
import { isAddressEqual, toBytes, hexToBytes, toHex, fromHex } from "viem";
import { useAuth } from "@/stores/useAuth";
import { errToast } from "@/utils/toast";
import { useLightVerifyingPaymasterGetHash } from "@/wagmi";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type TransactionDialogProps = {
  address: Address;
  chainId: number;
  owners: {
    id: string;
    address: string;
    weight: number;
  }[];
  userOperation: UserOperation;
  userOpHash: Hex;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TransactionDialog: FC<TransactionDialogProps> = ({
  address,
  chainId,
  userOperation,
  userOpHash,
  owners,
}) => {
  const { address: userAddress } = useAuth();

  const subdigest = subdigestOf(
    address,
    hexToBytes(userOpHash),
    BigInt(chainId),
  );

  const { data, signMessage } = useSignMessage({
    message: { raw: toBytes(subdigest) },
  });

  const { data: paymasterHash } = useLightVerifyingPaymasterGetHash({
    address: userOperation.paymasterAndData.slice(0, 42) as Address,
    chainId,
    args: [
      {
        sender: userOperation.sender,
        nonce: userOperation.nonce,
        initCode: userOperation.initCode,
        callData: userOperation.callData,
        callGasLimit: userOperation.callGasLimit,
        verificationGasLimit: userOperation.verificationGasLimit,
        preVerificationGas: userOperation.preVerificationGas,
        maxFeePerGas: userOperation.maxFeePerGas,
        maxPriorityFeePerGas: userOperation.maxPriorityFeePerGas,
        paymasterAndData: userOperation.paymasterAndData,
        signature: toHex(new Uint8Array([2])),
      },
      fromHex(`0x${userOperation.paymasterAndData.slice(154, 162)}`, "number"),
      fromHex(`0x${userOperation.paymasterAndData.slice(162, 170)}`, "number"),
    ],
  });

  const owner = useMemo(() => {
    if (!userAddress) return;

    return owners?.find(owner =>
      isAddressEqual(owner.address as Address, userAddress),
    );
  }, [owners, userAddress]);

  useEffect(() => {
    const fetchUserOp = async () => {
      if (!data || !owner) return;

      const res = await createUserOperation({
        params: {
          query: {
            chain_id: chainId,
          },
        },
        body: {
          signature: {
            owner_id: owner.id,
            signature: toHex(new Uint8Array([...toBytes(data), 2])),
            signature_type: 1,
          },
          user_operation: {
            chain_id: Number(chainId),
            hash: userOpHash,
            nonce: Number(userOperation.nonce),
            init_code: userOperation.initCode,
            sender: userOperation.sender,
            call_data: userOperation.callData,
            call_gas_limit: Number(userOperation.callGasLimit),
            verification_gas_limit: Number(userOperation.verificationGasLimit),
            pre_verification_gas: Number(userOperation.preVerificationGas),
            max_fee_per_gas: Number(userOperation.maxFeePerGas),
            max_priority_fee_per_gas: Number(
              userOperation.maxPriorityFeePerGas,
            ),
            paymaster_and_data: userOperation.paymasterAndData,
          },
        },
      });

      res.match(
        res => {
          toast({
            title: "You submitted the userOperation result",
            description: (
              <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                <code className="text-white">
                  {JSON.stringify(res, null, 2)}
                </code>
              </pre>
            ),
          });
        },
        err => {
          errToast(err);
        },
      );
    };

    fetchUserOp();
  }, [data, owner, chainId, userOperation, userOpHash, subdigest]);

  return (
    <>
      <div className="mt-4 flex flex-col space-y-3 text-center sm:text-left">
        <header className="text-lg font-semibold leading-none tracking-tight">
          Transaction
        </header>
        <p className="text-sm text-text-weak">
          Are you sure you want to sign this transaction?
        </p>
      </div>
      <div className="grid gap-4 py-4">
        <pre className="grid grid-cols-4 items-center gap-4 overflow-auto">
          <code>
            userOperation:{" "}
            {userOperation && serializeUserOperation(userOperation)}
          </code>
        </pre>
        <pre className="grid grid-cols-4 items-center gap-4 overflow-auto">
          <code className="break-all text-text">chainId: {chainId}</code>
        </pre>
        <pre className="grid grid-cols-4 items-center gap-4 overflow-auto">
          <code className="break-all text-text">userOpHash: {userOpHash}</code>
        </pre>
        <pre className="grid grid-cols-4 items-center gap-4 overflow-auto">
          <code className="break-all text-text">
            paymasterHash: {paymasterHash}
          </code>
        </pre>
        <pre className="grid grid-cols-4 items-center gap-4 overflow-auto">
          <code className="break-all text-text">subdigest: {subdigest}</code>
        </pre>
        <pre className="grid grid-cols-4 items-center gap-4 overflow-auto">
          <code className="break-all text-text">
            owners: {owners && JSON.stringify(owners, null, 2)}
          </code>
        </pre>
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
        <Button disabled={!owner} onClick={() => signMessage()}>
          Sign Transaction
        </Button>
      </div>
    </>
  );
};
