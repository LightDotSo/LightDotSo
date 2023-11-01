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
import { validateAddress } from "@/handlers/validators/address";
import { handler as addressHandler } from "@/handlers/paths/[address]";
import type { Address, Hex } from "viem";
import { toHex, fromHex } from "viem";
import { getUserOperationHash, type UserOperation } from "permissionless";
import { validateHex } from "@/handlers/validators/hex";
import { validateNumber } from "@/handlers/validators/number";
import { parseNumber } from "@/handlers/parsers/number";

export const handler = async (
  params: { address: string; chainId: string },
  searchParams: {
    initCode?: string;
    callData?: string;
  },
): Promise<{ userOperation: UserOperation; hash: Hex }> => {
  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  await addressHandler(params);

  // ---------------------------------------------------------------------------
  // Validators
  // ---------------------------------------------------------------------------

  validateAddress(params.address);

  validateNumber(params.chainId);

  if (searchParams?.initCode) {
    validateHex(searchParams.initCode);
  }

  if (searchParams?.callData) {
    validateHex(searchParams.callData);
  }

  const chainId = parseNumber(params.chainId);

  // ---------------------------------------------------------------------------
  // Defaults
  // ---------------------------------------------------------------------------

  const op: UserOperation = {
    sender: params.address as Address,
    paymasterAndData: "0x",
    nonce: 0n,
    initCode: (searchParams?.initCode as Hex) ?? "0x",
    callData: (searchParams?.callData as Hex) ?? "0x",
    signature:
      "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
    callGasLimit: fromHex("0x44E1C0" as Hex, { to: "bigint" }),
    verificationGasLimit: fromHex("0x1C4B40" as Hex, { to: "bigint" }),
    preVerificationGas: fromHex("0x1C4B40" as Hex, { to: "bigint" }),
    maxFeePerGas: fromHex("0xD320B3B35" as Hex, { to: "bigint" }),
    maxPriorityFeePerGas: fromHex("0xB323DBB31" as Hex, { to: "bigint" }),
  };
  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  const res = await getPaymasterGasAndPaymasterAndData(
    chainId,
    [
      {
        sender: params.address,
        paymasterAndData: "0x",
        nonce: toHex(0),
        initCode: searchParams?.initCode ?? "0x",
        callData: searchParams?.callData ?? "0x",
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

  if (res.isErr()) {
    notFound();
  }

  // ---------------------------------------------------------------------------
  // Parse
  // ---------------------------------------------------------------------------

  const parsedRes = res._unsafeUnwrap();

  const userOperation = {
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

  const hash = getUserOperationHash({
    userOperation,
    entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    chainId,
  });

  return { userOperation, hash };
};
