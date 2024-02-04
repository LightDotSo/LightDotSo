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

import { useAuth } from "@lightdotso/stores";
import { LightLogo } from "@lightdotso/svg";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FC } from "react";
import { usePathType } from "@/hooks";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const RootLogo: FC = () => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { address } = useAuth();

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const pathType = usePathType();

  // ---------------------------------------------------------------------------
  // Next Hooks
  // ---------------------------------------------------------------------------

  const pathname = usePathname();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Link
      href={
        typeof address === "undefined"
          ? "/"
          : pathType === "unauthenticated" || pathType === "demo"
            ? "/"
            : pathType === "authenticated"
              ? "/wallets"
              : // Get the wallet address from the path
                // Address is the first part of the path
                // e.g. /0x1234
                `/${pathname.split("/")[1]}/overview`
      }
      className="hover:rounded-md hover:bg-background-stronger"
    >
      <LightLogo className="m-2.5 size-8 fill-text" />
    </Link>
  );
};
