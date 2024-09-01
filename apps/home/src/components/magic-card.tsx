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

// Ref: https://magicui.design/docs/components/magic-card
// From: https://github.com/magicuidesign/magicui/blob/5ade13d309644c18ed29b2573d7abb7d6003df48/registry/components/magicui/magic-card.tsx
// License: MIT

"use client";

import { cn } from "@lightdotso/utils";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export interface MagicCardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: ReactNode;
  size?: number;
  backgroundColor?: string;
  borderColor?: string;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function MagicCard({
  children,
  className,
  size = 600,
  borderColor = "hsl(0 0% 98%)",
  ...props
}: MagicCardProps) {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      style={
        {
          "--mask-size": `${size}px`,
          "--border-color": `${borderColor}`,
        } as CSSProperties
      }
      className={cn(
        "relative z-10 h-full w-full overflow-hidden rounded-md",
        // This is the border color that is present in the inset
        "bg-gray-500 dark:bg-gray-700",
        "bg-[radial-gradient(var(--mask-size)_circle_at_var(--mouse-x)_var(--mouse-y),var(--border-color),transparent_100%)]",
        className,
      )}
      {...props}
    >
      <div className="z-10">{children}</div>
      <div
        className={cn(
          "-z-20 absolute inset-[1px] rounded-md bg-white dark:bg-black",
        )}
      />
    </div>
  );
}
