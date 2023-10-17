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

type DeployButtonProps = {
  chainId?: number;
  children: React.ReactNode;
};

export function DeployButton({
  chainId = 11155111,
  children,
}: DeployButtonProps) {
  const { setInitCode } = useTransactionStore();

  const deploy = useCallback(() => {
    setInitCode(chainId.toString());
  }, [chainId, setInitCode]);

  return (
    <DialogTrigger asChild>
      <Button onClick={deploy}>{children}</Button>
    </DialogTrigger>
  );
}
