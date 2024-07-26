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
    const slugs = pathname.split("/").filter((slug) => slug);

    // If the first slug is `demo`, return `/demo`
    if (slugs.length > 0 && slugs[0] === "demo") {
      return "/demo";
    }

    // Return the first slug if it is an address
    return slugs.length > 0 && isAddress(slugs[0]) ? `/${slugs[0]}` : "";
  }, [pathname]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return baseSlug;
};
