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

import { useSettings } from "@lightdotso/stores";
import dynamic from "next/dynamic";
import { useEffect } from "react";

// -----------------------------------------------------------------------------
// Dynamic
// -----------------------------------------------------------------------------

const ReactQueryDevtoolsProduction = dynamic(() =>
  // @ts-ignore
  import("@tanstack/react-query-devtools/production").then((d) => ({
    default: d.ReactQueryDevtools,
  })),
);

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const ReactQueryWrapper = () => {
  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // Only set once on initial render
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_VERCEL_ENV !== "production") {
      setIsQueryDevToolsOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { isQueryDevToolsOpen, setIsQueryDevToolsOpen } = useSettings();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      {isQueryDevToolsOpen && (
        <div className="hidden lg:block">
          <ReactQueryDevtoolsProduction />
        </div>
      )}
    </>
  );
};
