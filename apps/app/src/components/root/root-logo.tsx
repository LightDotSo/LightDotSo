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

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FC } from "react";
import { Logo } from "@/components/lightdotso/light-logo";
import { usePathType } from "@/hooks/usePathType";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const RootLogo: FC = () => {
  const type = usePathType();
  const pathname = usePathname();

  return (
    <Link
      href={
        type === "unauthenticated"
          ? "/"
          : type === "authenticated"
            ? "/wallets"
            : // Get the wallet address from the path
              // Address is the first part of the path
              // e.g. /0x1234
              `/${pathname.split("/")[1]}`
      }
      className="hover:rounded-md hover:bg-background-stronger"
    >
      <Logo className="m-2.5 h-8 w-8 fill-slate-600 dark:fill-slate-300" />
    </Link>
  );
};
