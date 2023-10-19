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
import { toBytes, type Address, toHex } from "viem";
import { useCallback } from "react";
import { sendUserOperation } from "@lightdotso/client";

type ConfirmDialogProps = {
  address: Address;
  chainId: number;
  config: {
    address: string;
    checkpoint: number;
    id: string;
    image_hash: string;
    owners: {
      address: string;
      id: string;
      weight: number;
    }[];
    threshold: number;
  };
  userOperation: {
    chain_id: number;
    call_data: string;
    call_gas_limit: number;
    hash: string;
    init_code: string;
    max_fee_per_gas: number;
    max_priority_fee_per_gas: number;
    nonce: number;
    paymaster_and_data: string;
    pre_verification_gas: number;
    sender: string;
    verification_gas_limit: number;
    signatures: {
      owner_id: string;
      signature: string;
      signature_type: number;
    }[];
  };
};

const uint16ToUint8Array = (num: number) => {
  return new Uint8Array([
    // Get the first 8 bits by using a bitwise AND with "1111111100000000" and a bitwise right shift
    (num & 0xff00) >> 8,
    // Get the last 8 bits by using a bitwise AND with "0000000011111111"
    num & 0x00ff,
  ]);
};

export function ConfirmDialog({
  // address,
  chainId,
  userOperation,
  config,
}: ConfirmDialogProps) {
  // Get the cumulative weight of all owners in the userOperation signatures array and check if it is greater than or equal to the threshold
  const isValid =
    userOperation.signatures.reduce((acc, signature) => {
      return (
        acc +
        ((config &&
          config.owners.find(owner => owner.id === signature?.owner_id)
            ?.weight) ||
          0)
      );
    }, 0) >= (config ? config.threshold : 0);

  // A `useCallback` handler for confirming the operation
  const handleConfirm = useCallback(async () => {
    // Construct the signature object in Uint8Array format

    // For each signature in the userOperation signatures array and concatenate into one Uint8Array
    //  - Get the owner from the config owners array
    //  - Get the owner weight
    const signatureArray = userOperation.signatures.flatMap(signature => {
      const owner = config.owners.find(
        owner => owner.id === signature?.owner_id,
      );
      const weight = owner?.weight || 0;

      // Return the signature in Uint8Array format
      return [
        ...uint16ToUint8Array(weight),
        ...Array.from(toBytes(signature.signature)),
      ];
    });

    const signature = new Uint8Array(signatureArray);

    // Prepend the threshold and signature to the userOperation signatures array
    const pre_sig = new Uint8Array([
      // Default to legacy signature type if not provided
      // Assumes that all signatures are of the same type

      // uint16
      ...uint16ToUint8Array(config.threshold),
      // uint32
      ...uint16ToUint8Array(config.checkpoint),
      // uint16
      ...uint16ToUint8Array(userOperation.signatures[0]?.signature_type || 0),
    ]);
    // Concatenate the pre_sig and signature arrays
    const sig = new Uint8Array([...pre_sig, ...signature]);

    // Sned the user operation
    const res = await sendUserOperation(chainId, [
      {
        sender: userOperation.sender,
        nonce: toHex(userOperation.nonce),
        initCode: userOperation.init_code,
        callData: userOperation.call_data,
        paymasterAndData: userOperation.paymaster_and_data,
        callGasLimit: toHex(userOperation.call_gas_limit),
        verificationGasLimit: toHex(userOperation.verification_gas_limit),
        preVerificationGas: toHex(userOperation.pre_verification_gas),
        maxFeePerGas: toHex(userOperation.max_fee_per_gas),
        maxPriorityFeePerGas: toHex(userOperation.max_priority_fee_per_gas),
        signature: toHex(sig),
      },
      "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    ]);

    toast({
      title: "You submitted the userOperation result",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(res, null, 2)}</code>
        </pre>
      ),
    });
  }, [chainId, config, userOperation]);

  return (
    <>
      <div className="mt-4 flex flex-col space-y-3 text-center sm:text-left">
        <header className="text-lg font-semibold leading-none tracking-tight">
          Confirm
        </header>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to sign this confirm?
        </p>
      </div>
      <div className="grid gap-4 py-4">
        <pre className="grid grid-cols-4 items-center gap-4 overflow-auto">
          <code>userOperation: {JSON.stringify(userOperation, null, 2)}</code>
        </pre>
        <pre className="grid grid-cols-4 items-center gap-4 overflow-auto">
          <code className="break-all text-primary">chainId: {chainId}</code>
        </pre>
        <pre className="grid grid-cols-4 items-center gap-4 overflow-auto">
          <code className="break-all text-primary">
            config: {JSON.stringify(config, null, 2)}
          </code>
        </pre>
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
        <Button disabled={!isValid} onClick={() => handleConfirm()}>
          Sign Confirm
        </Button>
      </div>
    </>
  );
}

// "0x000100000001000193cf3925dde13d85c1abd3d0f5eaa8e46f97a66b0c390ac81abfaffeb84e648b0e1bc8504e0341e42158c0929798bd4cf45a88249fdceff2ad436bd013c678271b02"
// "0x000100000001000186b1b39f492dcf87a23f645c8d9c58ba2dd51368b3418ddc422575375aca640c0a82c5eda9ca6a9313c0c59c4dd533d13fd6e7f54b2e927965ea05eeeb43b1f21b01"
// "0x0001000000010001783610798879fb9af654e2a99929e00e82c3a0f4288c08bc30266b64dc3e23285d634f6658fdeeb5ba9193b5e935a42a1d9bdf5007144707c9082e6eda5d8fbd1b01"
// "0x00010000000100018676f4db87420ca3de1fdb1f6a513924ef36570bb11b5ba345c22fd2fe430f672890496b0ede044dcd7a17c1d2d3e0e31808a9fedadeca920f368322ab6804d01c01"
// "0x0001000000010001783610798879fb9af654e2a99929e00e82c3a0f4288c08bc30266b64dc3e23285d634f6658fdeeb5ba9193b5e935a42a1d9bdf5007144707c9082e6eda5d8fbd1b01"
// "0x00010000000100018fb2dd47b62fa9e408827e63ea90c6a6607a42da44f2e497fc2ef75653b2873b61541c29124faa87fe3789ff9249420f937e678bb58a68693c6eeb6e068be2791b02"
