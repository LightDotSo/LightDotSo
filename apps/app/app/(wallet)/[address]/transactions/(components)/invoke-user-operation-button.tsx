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
import { Button } from "@lightdotso/ui";
import { RefreshCcw } from "lucide-react";
import type { FC } from "react";
import type { Address } from "viem";
import { errorToast, infoToast, successToast } from "@/utils";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface InvokeUserOperationProps {
  address: Address;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const InvokeUserOperationButton: FC<InvokeUserOperationProps> = ({
  address,
}) => {
  return (
    <Button
      variant="outline"
      className="py-5"
      onClick={() => {
        updateUserOperation({
          params: { query: { address: address } },
        }).then(res => {
          infoToast("Updating operation...");
          res.match(
            _success => {
              successToast("Operation updated");
            },
            err => {
              if (err instanceof Error) {
                errorToast(err.message);
              }
            },
          );
        });
      }}
    >
      <RefreshCcw className="h-4 w-4 text-text-weak" />
    </Button>
  );
};
