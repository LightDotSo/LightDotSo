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

import { getPaymasterGasAndPaymasterAndData } from "@lightdotso/client";
import { notFound } from "next/navigation";
import { getUserOperationHash } from "permissionless";
import { toHex, fromHex } from "viem";
import type { Address, Hex } from "viem";
import { userOperationsParser } from "@/app/(wallet)/[address]/op/(hooks)";
import { handler as addressHandler } from "@/handlers/paths/[address]/handler";
import { validateAddress } from "@/handlers/validators/address";
import { type UserOperation } from "@/types";

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

export const handler = async (
  params: { address: string },
  searchParams: {
    userOperations?: string;
  },
): Promise<{
  userOperations: UserOperation[];
  hashes: Hex[];
  chainIds: number[];
}> => {
  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  await addressHandler(params);

  // ---------------------------------------------------------------------------
  // Validators
  // ---------------------------------------------------------------------------

  validateAddress(params.address);

  // ---------------------------------------------------------------------------
  // Parsers
  // ---------------------------------------------------------------------------

  const userOperationsQuery = userOperationsParser.parseServerSide(
    searchParams.userOperations,
  );

  if (!userOperationsQuery) {
    notFound();
  }

  // ---------------------------------------------------------------------------
  // Defaults
  // ---------------------------------------------------------------------------

  let ops: UserOperation[] =
    userOperationsQuery &&
    userOperationsQuery.map(operation => {
      return {
        sender: params.address as Address,
        paymasterAndData: "0x",
        nonce: 0n,
        initCode: (operation.initCode as Hex) ?? "0x",
        callData: (operation.callData as Hex) ?? "0x",
        signature:
          "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
        callGasLimit: fromHex("0x44E1C0" as Hex, { to: "bigint" }),
        verificationGasLimit: fromHex("0x1C4B40" as Hex, { to: "bigint" }),
        preVerificationGas: fromHex("0x1C4B40" as Hex, { to: "bigint" }),
        maxFeePerGas: fromHex("0xD320B3B35" as Hex, { to: "bigint" }),
        maxPriorityFeePerGas: fromHex("0xB323DBB31" as Hex, { to: "bigint" }),
      };
    });
  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  const resPromises = ops.map((op, index) => {
    return getPaymasterGasAndPaymasterAndData(
      userOperationsQuery[index].chainId as number,
      [
        {
          sender: params.address,
          paymasterAndData: "0x",
          nonce: toHex(0),
          initCode: op.initCode,
          callData: op.callData,
          signature: "0x",
          callGasLimit: toHex(op.callGasLimit),
          verificationGasLimit: toHex(op.verificationGasLimit),
          preVerificationGas: toHex(op.preVerificationGas),
          maxFeePerGas: toHex(op.maxFeePerGas),
          maxPriorityFeePerGas: toHex(op.maxPriorityFeePerGas),
        },
      ],
      false,
    );
  });

  // Resolve all promises
  const res = await Promise.all(resPromises);

  // If there are any errors among responses
  if (res.some(r => r.isErr())) {
    notFound();
  }

  const userOperations = ops.map((op, index) => {
    // Parse
    const parsedRes = res[index]._unsafeUnwrap();

    // Combine default operation data with response data
    return {
      ...op,
      callGasLimit: fromHex(parsedRes.callGasLimit as Hex, { to: "bigint" }),
      verificationGasLimit: fromHex(parsedRes.verificationGasLimit as Hex, {
        to: "bigint",
      }),
      preVerificationGas: fromHex(parsedRes.preVerificationGas as Hex, {
        to: "bigint",
      }),
      maxFeePerGas: fromHex(parsedRes.maxFeePerGas as Hex, { to: "bigint" }),
      maxPriorityFeePerGas: fromHex(parsedRes.maxPriorityFeePerGas as Hex, {
        to: "bigint",
      }),
      paymasterAndData: parsedRes.paymasterAndData as Hex,
    };
  });

  // Generate user hashes
  const hashes = userOperations.map((userOperation, index) =>
    getUserOperationHash({
      userOperation,
      entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
      chainId: userOperationsQuery[index].chainId as number,
    }),
  );

  // Get the chainIds from the userOperationsQuery
  const chainIds = userOperationsQuery.map(op => op.chainId as number);

  // Return an object containing an array of userOperations and an array of hashes
  return {
    userOperations: userOperations,
    hashes: hashes,
    chainIds: chainIds,
  };
};
