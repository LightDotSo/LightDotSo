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

import type { FC } from "react";
import { TokenImage } from "@/components/token/token-image";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type TokenCardTokenProps = {
  address: string;
  chain_id: number;
  amount: number;
  decimals: number;
  name?: string | null;
  symbol: string;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TokenCardToken: FC<TokenCardTokenProps> = ({
  address,
  chain_id,
  amount,
  name,
  symbol,
  decimals,
}) => {
  return (
    <div className="flex items-center space-x-3">
      <TokenImage
        address={address}
        chain_id={chain_id}
        name={name}
        symbol={symbol}
      />{" "}
      <div className="flex flex-col space-y-1.5">
        <span className="text-sm text-text/90">{name ?? symbol}</span>
        <span className="text-sm text-text-weak">
          {(amount / 10 ** decimals).toFixed(3)} {symbol}
        </span>
      </div>
    </div>
  );
};
