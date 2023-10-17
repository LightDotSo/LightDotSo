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

import { Button, DialogTrigger } from "@lightdotso/ui";
import { useTransactionStore } from "@/stores/useTransaction";
import { useCallback } from "react";
import { encodePacked, encodeAbiParameters, getFunctionSelector } from "viem";
import { useAuth } from "@/stores/useAuth";

type DeployButtonProps = {
  chainId?: number;
  children: React.ReactNode;
};

export function DeployButton({
  chainId = 11155111,
  children,
}: DeployButtonProps) {
  const { wallet } = useAuth();
  const { setInitCode, setChainId } = useTransactionStore();

  const deploy = useCallback(() => {
    if (!wallet) return;

    let initCode = encodePacked(
      ["address", "bytes"],
      [
        wallet,
        encodeAbiParameters(
          [
            {
              type: "bytes",
            },
            {
              type: "bytes32",
            },
            {
              type: "bytes32",
            },
          ],
          [
            getFunctionSelector("createAccount(bytes32,bytes32)"),
            "0x0000000000000000000000000000000000000000000000000000000000000003",
            "0x0000000000000000000000000000000000000000000000000000000000000003",
          ],
        ),
      ],
    );
    setInitCode(initCode);
    setChainId(chainId);
  }, [chainId, setChainId, setInitCode, wallet]);

  return (
    <DialogTrigger asChild>
      <Button onClick={deploy}>{children}</Button>
    </DialogTrigger>
  );
}
