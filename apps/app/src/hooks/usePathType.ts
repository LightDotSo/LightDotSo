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

import { usePathname } from "next/navigation";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type RootType = "authenticated" | "unauthenticated" | "wallet";

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const usePathType = (): RootType => {
  const pathname = usePathname();

  const unauthenticatedPaths = ["/", "/activity", "/owners", "/transactions"];
  const authenticatedPaths = [
    "/new",
    "/new/configuration",
    "/new/confirm",
    "/wallet",
    "/settings",
    "/settings",
    "/settings/account",
    "/settings/appearance",
    "/settings/display",
    "/settings/notifications",
    "/support",
    "/wallets",
  ];

  if (unauthenticatedPaths.includes(pathname)) {
    return "unauthenticated";
  }

  if (authenticatedPaths.includes(pathname)) {
    return "authenticated";
  }

  return "wallet";
};
