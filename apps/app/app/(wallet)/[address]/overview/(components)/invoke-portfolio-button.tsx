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

import { Button } from "@lightdotso/ui";
import invokePortfolioAction from "@/actions/invokePortfolioAction";
import type { Address } from "viem";
import { successToast } from "@/utils/toast";
import { RefreshCcw } from "lucide-react";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface InvokePortfolioButtonProps {
  address: Address;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const InvokePortfolioButton: FC<InvokePortfolioButtonProps> = ({
  address,
}) => {
  return (
    <Button
      variant="outline"
      className="py-5"
      onClick={() => {
        invokePortfolioAction(address as Address);
        successToast("Refreshed");
      }}
    >
      <RefreshCcw className="h-4 w-4 text-text-weak" />
    </Button>
  );
};
