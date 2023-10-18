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

import { Button } from "@lightdotso/ui";
import { useSignMessage } from "wagmi";
import { serializeUserOperation } from "@/utils/userOp";
import type { UserOperation } from "permissionless";
import type { Hex } from "viem";

type TransactionDialogProps = {
  chainId: number;
  userOperation: UserOperation;
  userOpHash: Hex;
};

export function TransactionDialog({
  chainId,
  userOperation,
  userOpHash,
}: TransactionDialogProps) {
  const { signMessage } = useSignMessage({
    message: "gm wagmi frens",
  });

  return (
    <>
      <div className="mt-4 flex flex-col space-y-3 text-center sm:text-left">
        <header className="text-lg font-semibold leading-none tracking-tight">
          Transaction
        </header>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to sign this transaction?
        </p>
      </div>
      <div className="grid gap-4 py-4">
        <pre className="grid grid-cols-4 items-center gap-4 overflow-auto">
          <code>userOperation: {serializeUserOperation(userOperation)}</code>
        </pre>
        <pre className="grid grid-cols-4 items-center gap-4 overflow-auto">
          <code className="break-all text-primary">chainId: {chainId}</code>
        </pre>
        <pre className="grid grid-cols-4 items-center gap-4 overflow-auto">
          <code className="break-all text-primary">
            userOpHash: {userOpHash}
          </code>
        </pre>
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
        <Button onClick={() => signMessage()}>Sign Transaction</Button>
      </div>
    </>
  );
}
