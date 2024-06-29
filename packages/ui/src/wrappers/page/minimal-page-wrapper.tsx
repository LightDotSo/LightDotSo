// Copyright 2023-2024 Light
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

import { cn } from "@lightdotso/utils";
import type { ReactNode } from "react";
import { baseHeightWrapper } from "../base";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface MinimalPageWrapperProps {
  children: ReactNode;
}

// -----------------------------------------------------------------------------
// Layout
// -----------------------------------------------------------------------------

export function MinimalPageWrapper({ children }: MinimalPageWrapperProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col space-y-6 overflow-y-hidden",
        baseHeightWrapper,
      )}
    >
      {children}
    </div>
  );
}
