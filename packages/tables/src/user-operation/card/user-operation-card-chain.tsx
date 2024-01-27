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

import type { UserOperationData } from "@lightdotso/data";
import type { FC } from "react";
import { ChainCard } from "../../(components)/card";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type UserOperationCardChainProps = { userOperation: UserOperationData };

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const UserOperationCardChain: FC<UserOperationCardChainProps> = ({
  userOperation: { chain_id },
}) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <ChainCard
      className="group-[.transaction]:w-24 group-[.transaction]:sm:w-32 group-[.transaction]:md:w-40"
      chain_id={chain_id}
    />
  );
};
