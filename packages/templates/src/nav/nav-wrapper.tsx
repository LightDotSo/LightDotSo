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

import { cn } from "@lightdotso/utils";
import type { ReactNode } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export interface NavWrapperProps {
  nav: ReactNode;
  className?: string;
  navClassName?: string;
  rootClassName?: string;
  navChildren?: ReactNode;
  children: ReactNode;
}

// -----------------------------------------------------------------------------
// Layout
// -----------------------------------------------------------------------------

export function NavWrapper({
  nav,
  className,
  navClassName,
  rootClassName,
  navChildren,
  children,
}: NavWrapperProps) {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <main>
      <div className={cn("flex flex-col", rootClassName)}>
        <div
          className={cn(
            "sticky top-0 z-50 border-b border-b-border-weak bg-background-body",
            className,
          )}
        >
          <div className={cn("flex h-16 items-center", navClassName)}>
            {nav}
          </div>
          {navChildren}
        </div>
        {children}
      </div>
    </main>
  );
}
