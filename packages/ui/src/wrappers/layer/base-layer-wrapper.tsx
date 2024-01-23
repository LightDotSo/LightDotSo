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

import { cn } from "@lightdotso/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { baseWidthWrapper } from "../base";

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------

const baseLayerWrapperVariants = cva(["px-0"], {
  variants: {
    size: {
      default: "max-w-7xl",
      sm: "max-w-5xl",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export interface BaseLayerWrapperProps
  extends VariantProps<typeof baseLayerWrapperVariants> {
  children: ReactNode;
  className?: string;
}

// -----------------------------------------------------------------------------
// Layout
// -----------------------------------------------------------------------------

export function BaseLayerWrapper({
  children,
  className,
  size,
}: BaseLayerWrapperProps) {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      className={cn(
        "flex w-full flex-row overflow-x-scroll",
        baseWidthWrapper,
        className,
      )}
    >
      <div className={cn("mx-auto flex-1", baseLayerWrapperVariants({ size }))}>
        {children}
      </div>
    </div>
  );
}
