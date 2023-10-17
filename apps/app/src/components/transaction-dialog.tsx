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

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@lightdotso/ui";
import { useTransactionStore } from "@/stores/useTransaction";
import { useSignMessage } from "wagmi";
import { serializeUserOperation } from "@/utils/userOp";
import { useEffect } from "react";
import { getPaymasterGasAndPaymasterAndData } from "@lightdotso/client";
import { toHex } from "viem";

type TransactionDialogProps = {
  children: React.ReactNode;
};

export function TransactionDialog({ children }: TransactionDialogProps) {
  const { chainId, userOperation, isValid } = useTransactionStore();
  const { isLoading, signMessage } = useSignMessage({
    message: "gm wagmi frens",
  });

  useEffect(() => {
    const fetchData = async () => {
      let res = await getPaymasterGasAndPaymasterAndData(chainId, {
        sender: userOperation.sender,
        paymasterAndData: userOperation.paymasterAndData,
        nonce: toHex(userOperation.nonce),
        initCode: userOperation.initCode,
        callData: userOperation.callData,
        signature: userOperation.signature,
      });
      console.info(res);
    };

    if (!chainId) return;

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId]);

  return (
    <Dialog>
      {children}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="mt-4 space-y-3">
          <DialogTitle>Transaction</DialogTitle>
          <DialogDescription>
            Are you sure you want to sign this transaction?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <pre className="grid grid-cols-4 items-center gap-4 overflow-auto">
            <code>userOperation: {serializeUserOperation(userOperation)}</code>
          </pre>
          <pre className="grid grid-cols-4 items-center gap-4 overflow-auto">
            <code className="break-all text-primary">chainId: {chainId}</code>
          </pre>
        </div>
        <DialogFooter>
          <Button
            disabled={isLoading || !isValid()}
            onClick={() => signMessage()}
          >
            Sign Transaction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
