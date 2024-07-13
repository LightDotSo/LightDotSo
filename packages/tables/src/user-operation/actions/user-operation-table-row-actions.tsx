// Copyright 2023-2024 LightDotSo.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

"use client";

import type { UserOperationData } from "@lightdotso/data";
import {
  useMutationQueueInterpretation,
  useMutationQueueUserOperation,
} from "@lightdotso/query";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@lightdotso/ui";
import { getEtherscanUrlWithChainId } from "@lightdotso/utils";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import type { Row } from "@tanstack/react-table";
import type { Address } from "viem";

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

  const { queueUserOperation } = useMutationQueueUserOperation({
    address: row.original.sender as Address,
  });
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
              href={`${getEtherscanUrlWithChainId(
                row.original.chain_id,
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
            asChild
            onClick={() =>
              queueUserOperation({
                hash: row.original.hash,
              })
            }
          >
            Queue
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              queueInterpretation({ user_operation_hash: row.original.hash })
            }
          >
            Queue Interpretation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
