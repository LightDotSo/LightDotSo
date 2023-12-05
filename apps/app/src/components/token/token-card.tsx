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

import { Number, TableCell, TableRow } from "@lightdotso/ui";
import { Suspense } from "react";
import type { FC } from "react";
import type { Address } from "viem";
import { TokenCardActions } from "@/components/token/token-card-actions";
import { TokenCardPrice } from "@/components/token/token-card-price";
import { TokenCardSparkline } from "@/components/token/token-card-sparkline";
import { TokenCardToken } from "@/components/token/token-card-token";

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

export const shortenName = (name: string) => {
  return name.match(/\b\w/g)?.join("").substring(0, 3);
};

export const separateFloat = (x: number) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type TokenCardProps = {
  address: string;
  token: {
    address: string;
    chain_id: number;
    amount: number;
    balance_usd: number;
    decimals: number;
    name?: string | null;
    symbol: string;
  };
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TokenCard: FC<TokenCardProps> = ({
  address,
  token: {
    balance_usd,
    name,
    symbol,
    amount,
    decimals,
    address: tokenAddress,
    chain_id,
  },
}) => {
  return (
    <TableRow key={`${tokenAddress}-${chain_id}`}>
      <TableCell className="font-medium">
        <TokenCardToken
          address={tokenAddress}
          chain_id={chain_id}
          amount={amount}
          decimals={decimals}
          name={name}
          symbol={symbol}
        />
      </TableCell>
      <TableCell>
        <Number
          value={balance_usd}
          prefix="$"
          variant="neutral"
          size="balance"
        />
      </TableCell>
      <TableCell>
        <Suspense fallback={null}>
          <TokenCardSparkline
            address={tokenAddress as Address}
            chain_id={chain_id}
          />
        </Suspense>
      </TableCell>
      <TableCell>
        <Suspense fallback={null}>
          <TokenCardPrice
            address={tokenAddress as Address}
            chain_id={chain_id}
          />
        </Suspense>
      </TableCell>
      <TableCell>
        <TokenCardActions
          address={address as Address}
          tokenAddress={tokenAddress}
          tokenDecimals={decimals}
          tokenSymbol={symbol}
          chainId={chain_id}
        />
      </TableCell>
    </TableRow>
  );
};
