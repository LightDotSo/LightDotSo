// Copyright 2023-2024 Light, Inc.
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

import { Banner } from "@lightdotso/templates";
import type { FC } from "react";
import { useAppGroup } from "@/hooks";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const AppBanner: FC = () => {
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const appGroup = useAppGroup();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      {(appGroup === "wallet" ||
        appGroup === "authenticated" ||
        appGroup === "unauthenticated" ||
        appGroup === "interception" ||
        appGroup === "swap") && <Banner kind="beta" />}
      {appGroup === "demo" && <Banner kind="demo" />}
    </>
  );
};
