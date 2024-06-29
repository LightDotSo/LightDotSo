// Copyright 2023-2024 Light
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

import type { OwnerData } from "@lightdotso/data";
import { useCopy } from "@lightdotso/hooks";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  toast,
} from "@lightdotso/ui";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import type { Row } from "@tanstack/react-table";
import { useCallback } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface OwnerTableRowActionsProps {
  row: Row<OwnerData>;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function OwnerTableRowActions({ row }: OwnerTableRowActionsProps) {
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const [, copy] = useCopy();

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  const handleCopyClick = useCallback(() => {
    copy(row.original.address);
    toast.success("Copied to clipboard!");
  }, [row, copy]);

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
          <DropdownMenuItem onClick={handleCopyClick}>
            Copy Address
          </DropdownMenuItem>
        </DropdownMenuContent>
        {/* eslint-disable-next-line no-constant-binary-expression */}
        {false && (
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem onClick={handleCopyClick}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </div>
  );
}
