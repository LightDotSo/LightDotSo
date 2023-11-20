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

import type { Address } from "viem";
import { Send, RefreshCcw } from "lucide-react";
import { Button } from "@lightdotso/ui";
import type { FC } from "react";
import Link from "next/link";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type TokenCardActionsProps = {
  address: Address;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TokenCardActions: FC<TokenCardActionsProps> = ({ address }) => {
  return (
    <div className="flex items-center justify-end gap-x-4">
      <Button size="sm" className="rounded-full p-3">
        <RefreshCcw className="h-3 w-3" />
        <span className="sr-only">Open share modal</span>
      </Button>
      <Button size="sm" className="rounded-full p-3" asChild>
        <Link href={`/${address}/send`}>
          <Send className="h-3 w-3" />
          <span className="sr-only">Open send modal</span>
        </Link>
      </Button>
    </div>
  );
};
