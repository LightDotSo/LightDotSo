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
import { ContractLinks } from "@lightdotso/const";
import { calculateInitCode } from "@lightdotso/solutions";
import { Result } from "neverthrow";
import { notFound } from "next/navigation";
import { getUserOperationHash } from "permissionless";
import type { UserOperation as PermissionlessUserOperation } from "permissionless";
import { toHex, fromHex } from "viem";
import type { Address, Hex } from "viem";
import { userOperationsParser } from "@/app/(wallet)/[address]/op/(hooks)";
import { handler as addressHandler } from "@/handlers/paths/[address]/handler";
import { validateAddress } from "@/handlers/validators/address";
import { getConfiguration, getUserOperationNonce, getWallet } from "@/services";
import type { UserOperation } from "@/types";

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
  // Fetch Nonce
  // ---------------------------------------------------------------------------

  const noncePromises = userOperationsQuery.map(operation => {
    return getUserOperationNonce(
      params.address as Address,
      Number(operation.chainId) as number,
    );
  });

  // Resolve all promises
  const nonces = await Promise.all(noncePromises);

  // If there are any errors among responses
  if (nonces.some(n => n.isErr())) {
    notFound();
  }

  // ---------------------------------------------------------------------------
  // Fetch Wallet and Configuration
  // ---------------------------------------------------------------------------

  const walletPromise = getWallet(params.address as Address);

  const configPromise = getConfiguration(params.address as Address);

  const [walletRes, configRes] = await Promise.all([
    walletPromise,
    configPromise,
  ]);

  const walletAndConfigRes = Result.combineWithAllErrors([
    walletRes,
    configRes,
  ]);

  const { wallet, config } = walletAndConfigRes.match(
    ([wallet, config]) => {
      return {
        wallet: wallet,
        config: config,
      };
    },
    () => {
      return notFound();
    },
  );

  // ---------------------------------------------------------------------------
  // Defaults
  // ---------------------------------------------------------------------------

  let ops: Omit<UserOperation, "hash">[] =
    userOperationsQuery &&
    userOperationsQuery.map(operation => {
      const nonce =
        nonces[userOperationsQuery.indexOf(operation)]._unsafeUnwrap().nonce;
      return {
        chainId: operation.chainId as bigint,
        sender: params.address as Address,
        paymasterAndData: "0x",
        nonce: BigInt(nonce),
        initCode:
          operation.initCode ?? nonce === 0
            ? calculateInitCode(
                ContractLinks["Factory"] as Address,
                config.image_hash as Hex,
                wallet.salt as Hex,
              )
            : "0x",
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
      Number(userOperationsQuery[index].chainId) as number,
      [
        {
          sender: params.address,
          paymasterAndData: "0x",
          nonce: toHex(op.nonce),
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

  const parsedUserOperations = ops.map((op, index) => {
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
  const userOperations = parsedUserOperations.map((userOperation, index) => ({
    ...userOperation,
    hash: getUserOperationHash({
      userOperation: userOperation as PermissionlessUserOperation,
      entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
      chainId: Number(userOperationsQuery[index].chainId) as number,
    }),
  }));

  // Return an object containing an array of userOperations and an array of hashes
  return {
    userOperations: userOperations,
  };
};
