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

import { useAppGroup } from "@/hooks";
import { useAuth } from "@lightdotso/stores";
import { LightLogo } from "@lightdotso/svg";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const NavLogo: FC = () => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { address } = useAuth();

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const appGroup = useAppGroup();

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
        typeof address === "undefined" || appGroup === "authenticated"
          ? "/"
          : appGroup === "unauthenticated" || appGroup === "demo"
            ? "/"
            : appGroup === "action"
              ? "/swap"
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
