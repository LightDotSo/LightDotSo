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

import { createQueueInterpretation } from "@lightdotso/client";
import type { UserOperationData } from "@lightdotso/data";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  toast,
} from "@lightdotso/ui";
import { getChainById } from "@lightdotso/utils";
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
              href={`${
                getChainById(row.original.chain_id)?.blockExplorers?.default.url
              }/tx/${row.original.transaction?.hash}`}
            >
              Open in Explorer
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              const loadingToast = toast.loading("Queue has been created...");
              const res = await createQueueInterpretation({
                params: { query: { user_operation_hash: row.original.hash } },
              });
              res.match(
                () => {
                  toast.dismiss(loadingToast);
                  toast.success("Queue created!");
                },
                err => {
                  toast.dismiss(loadingToast);
                  if (err instanceof Error) {
                    toast.error(err.message);
                  } else {
                    toast.error("Failed to create queue!");
                  }
                },
              );
            }}
          >
            Queue
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
