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

import { cn } from "@lightdotso/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { baseWidthWrapper } from "../base";

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------

const baseLayerWrapperVariants = cva([], {
  variants: {
    size: {
      default: "max-w-7xl",
      sm: "max-w-5xl",
      xs: "max-w-2xl",
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
        "flex w-full flex-row overflow-x-scroll [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        baseWidthWrapper,
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto flex-1",
          baseLayerWrapperVariants({ size: size }),
        )}
      >
        {children}
      </div>
    </div>
  );
}
