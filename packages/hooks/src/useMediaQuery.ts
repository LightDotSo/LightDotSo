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

// @ts-nocheck
import * as config from "@lightdotso/tailwindcss";
import { useEffect, useState } from "react";
import resolveConfig from "tailwindcss/resolveConfig";

// From: https://github.com/shadcn-ui/ui/blob/fb614ac2921a84b916c56e9091aa0ae8e129c565/apps/www/hooks/use-media-query.tsx#L4
// License: MIT

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const fullConfig = resolveConfig(config);
const screens = fullConfig.theme?.screens as Record<string, string>;

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export function useMediaQuery(query: keyof typeof screens) {
  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [value, setValue] = useState(false);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches);
    }

    const result = matchMedia(`(min-width: ${screens[query]})`);
    result.addEventListener("change", onChange);
    setValue(result.matches);

    return () => result.removeEventListener("change", onChange);
  }, [query]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return value;
}
