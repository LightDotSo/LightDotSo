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
import { validateAddress } from "../validators/address";
import { handler as addressHandler } from "../[address]";
import type { Address, Hex } from "viem";
import { toHex, fromHex } from "viem";
import type { UserOperation } from "permissionless";

export const handler = async (
  params: { address: string; chainId: string },
  searchParams: {
    initCode?: string;
    callData?: string;
  },
): Promise<UserOperation> => {
  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  await addressHandler(params);

  // -------------------------------------------------------------------------
  // Validators
  // -------------------------------------------------------------------------

  validateAddress(params.address);

  // -------------------------------------------------------------------------
  // Defaults
  // -------------------------------------------------------------------------

  let op: UserOperation = {
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
  // -------------------------------------------------------------------------
  // Fetch
  // -------------------------------------------------------------------------

  let res = await getPaymasterGasAndPaymasterAndData(parseInt(params.chainId), [
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
  ]);

  if (!res?.callGasLimit) {
    throw notFound();
  }

  // -------------------------------------------------------------------------
  // Parse
  // -------------------------------------------------------------------------

  let setOp = {
    ...op,
    callGasLimit: fromHex(res.callGasLimit as Hex, { to: "bigint" }),
    verificationGasLimit: fromHex(res.verificationGasLimit as Hex, {
      to: "bigint",
    }),
    preVerificationGas: fromHex(res.preVerificationGas as Hex, {
      to: "bigint",
    }),
    maxFeePerGas: fromHex(res.maxFeePerGas as Hex, { to: "bigint" }),
    maxPriorityFeePerGas: fromHex(res.maxPriorityFeePerGas as Hex, {
      to: "bigint",
    }),
    paymasterAndData: res.paymasterAndData as Hex,
  };

  return setOp;
};
