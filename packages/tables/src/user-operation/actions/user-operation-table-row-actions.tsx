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
import { useMutationQueueInterpretation } from "@lightdotso/query";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@lightdotso/ui";
import { getChainById, getEtherscanUrl } from "@lightdotso/utils";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import type { Row } from "@tanstack/react-table";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface UserOperationTableRowActionsProps {
  row: Row<UserOperationData>;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function UserOperationTableRowActions({
  row,
}: UserOperationTableRowActionsProps) {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { queueInterpretation } = useMutationQueueInterpretation();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex items-center justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex size-8 p-0 data-[state=open]:bg-background-stronger"
          >
            <DotsHorizontalIcon className="size-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem asChild>
            <a
              target="_blank"
              rel="noreferrer"
              href={`${getEtherscanUrl(
                getChainById(row.original.chain_id),
              )}/tx/${row.original.transaction?.hash}`}
            >
              Open in Explorer
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              target="_blank"
              rel="noreferrer"
              href={`https://jiffyscan.xyz/userOpHash/${row.original.hash}`}
            >
              Open in Jiffyscan
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              queueInterpretation({ user_operation_hash: row.original.hash })
            }
          >
            Queue
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
