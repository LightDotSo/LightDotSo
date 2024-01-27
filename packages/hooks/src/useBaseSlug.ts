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
import { useMemo } from "react";
import { isAddress } from "viem";

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useBaseSlug = () => {
  // ---------------------------------------------------------------------------
  // Next Hooks
  // ---------------------------------------------------------------------------

  const pathname = usePathname();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const baseSlug = useMemo(() => {
    // Split the path using '/' as delimiter and remove empty strings
    const slugs = pathname.split("/").filter(slug => slug);

    // If the first slug is `demo`, return `/demo`
    if (slugs.length > 0 && slugs[0] === "demo") {
      return "/demo";
    }

    // Return the first slug if it is an address
    return slugs.length > 0 && isAddress(slugs[0]) ? "/" + slugs[0] : "";
  }, [pathname]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return baseSlug;
};
