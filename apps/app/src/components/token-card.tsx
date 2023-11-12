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

import { TableCell, TableRow } from "@lightdotso/ui";
import { TokenCardSparkline } from "./token-card-sparkline";
import { TokenCardActions } from "./token-card-actions";
import { Suspense } from "react";
import type { Address } from "viem";

type TokenCardProps = {
  address: string;
  token: {
    address: string;
    amount: number;
    balance_usd: number;
    decimals: number;
    name?: string | null;
    symbol: string;
  };
};

export const shortenName = (name: string) => {
  return name.match(/\b\w/g)?.join("").substring(0, 3);
};

export const separateFloat = (x: number) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export function TokenCard({
  token: { balance_usd, name, symbol, amount, decimals, address, chain_id },
}: TokenCardProps) {
  return (
    <TableRow key={name}>
      <TableCell className="font-medium">
        <span className="mr-1.5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-input bg-muted">
          <span className="overflow-hidden text-ellipsis text-xs leading-none text-muted-foreground">
            {shortenName(name ?? symbol)}
          </span>
        </span>{" "}
        {(amount / 10 ** decimals).toFixed(3)} {symbol}
      </TableCell>
      <TableCell>${balance_usd.toFixed(2)}</TableCell>
      <TableCell>
        <Suspense fallback={null}>
          <TokenCardSparkline
            address={address as Address}
            chain_id={chain_id}
          ></TokenCardSparkline>
        </Suspense>
      </TableCell>
      <TableCell className="text-right">
        <TokenCardActions address={address as Address}></TokenCardActions>
      </TableCell>
    </TableRow>
  );
}
