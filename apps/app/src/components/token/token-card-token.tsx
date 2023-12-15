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
import type { TokenData } from "@/data";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type TokenCardTokenProps = { token: TokenData };

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TokenCardToken: FC<TokenCardTokenProps> = ({ token }) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex items-center space-x-3">
      <TokenImage token={token} />{" "}
      <div className="flex flex-col space-y-1.5">
        <span className="text-sm text-text/90">
          {token.name ?? token.symbol}
        </span>
        <span className="text-sm text-text-weak">
          {(token.amount / 10 ** token.decimals).toFixed(3)} {token.symbol}
        </span>
      </div>
    </div>
  );
};
