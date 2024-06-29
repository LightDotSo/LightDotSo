// Copyright 2023-2024 Light.
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

// @ts-ignore
// import * as config from "@lightdotso/tailwindcss";
import { useEffect, useState } from "react";
// import resolveConfig from "tailwindcss/resolveConfig";

// From: https://github.com/shadcn-ui/ui/blob/fb614ac2921a84b916c56e9091aa0ae8e129c565/apps/www/hooks/use-media-query.tsx#L4
// License: MIT

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

// @ts-ignore
// const fullConfig = resolveConfig(config);
// const screens = fullConfig.theme?.screens as Record<string, string>;

const screens = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

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
