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

import { ArrowUpRight } from "lucide-react";
import type { FC } from "react";
import type { UserOperationData } from "@/data";
import { getChainById } from "@/utils";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type UserOperationCardHashProps = { userOperation: UserOperationData };

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const UserOperationCardHash: FC<UserOperationCardHashProps> = ({
  userOperation: { chain_id, hash },
}) => {
  return (
    <div className="group flex items-center space-x-1.5">
      <a
        className="group-hover:underline"
        target="_blank"
        rel="noreferrer"
        href={`${getChainById(chain_id)?.blockExplorers?.default
          .url}/tx/${hash}`}
      >
        {hash}
      </a>
      <ArrowUpRight className="ml-2 h-4 w-4 shrink-0 opacity-50 group-hover:underline group-hover:opacity-100" />
    </div>
  );
};
