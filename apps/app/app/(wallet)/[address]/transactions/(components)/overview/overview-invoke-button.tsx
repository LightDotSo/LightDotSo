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

import { updateUserOperation } from "@lightdotso/client";
import { useAuth } from "@lightdotso/stores";
import {
  ButtonIcon,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
  toast,
} from "@lightdotso/ui";
import { RefreshCcw } from "lucide-react";
import type { FC } from "react";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface InvokeUserOperationProps {
  address: Address;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const OverviewInvokeButton: FC<InvokeUserOperationProps> = ({
  address,
}) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <ButtonIcon
              variant="shadow"
              onClick={() => {
                const loadingToast = toast.info("Updating operation...");
                updateUserOperation(
                  {
                    params: { query: { address: address } },
                  },
                  clientType,
                ).then(res => {
                  toast.dismiss(loadingToast);
                  res.match(
                    _success => {
                      toast.success("Operation updated");
                    },
                    err => {
                      if (err instanceof Error) {
                        toast.error(err.message);
                      }
                    },
                  );
                });
              }}
            >
              <RefreshCcw className="size-4" />
            </ButtonIcon>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Refresh</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
