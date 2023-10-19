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

import type { Address } from "viem";

type ConfirmDialogProps = {
  address: Address;
  chainId: number;
  owners: {
    id: string;
    address: string;
    weight: number;
  }[];
  userOperation: {
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
  };
  // userOpHash: Uint8Array;
};

export function ConfirmDialog({
  address,
  chainId,
  userOperation,
  // userOpHash,
  owners,
}: ConfirmDialogProps) {
  console.info("address", address);
  // console.info("userOpHash", toHex(userOpHash));
  console.info("chainId", chainId);
  // console.info("subdigest", subdigest);

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
            owners: {JSON.stringify(owners, null, 2)}
          </code>
        </pre>
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
        {/* <Button disabled={!owner} onClick={() => signMessage()}>
          Sign Confirm
        </Button> */}
      </div>
    </>
  );
}
