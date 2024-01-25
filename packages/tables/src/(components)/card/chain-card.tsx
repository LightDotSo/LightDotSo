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

import { ChainLogo } from "@lightdotso/svg";
import { getChainById } from "@lightdotso/utils";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type ChainCardProps = { chain_id: number };

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const ChainCard: FC<ChainCardProps> = ({ chain_id }) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (chain_id === 0) {
    return <div className="shrink"></div>;
  }

  return (
    <div className="shrink">
      <div className="flex items-center justify-start space-x-1.5">
        <ChainLogo className="size-6" chainId={chain_id} />
        <span className="text-xs font-medium text-text md:text-sm">
          {getChainById(chain_id).name}
        </span>
      </div>
    </div>
  );
};
