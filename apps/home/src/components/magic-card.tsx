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
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import {} from "framer-motion";
import { type MouseEvent, useCallback, useEffect } from "react";
import type {
  CSSProperties,
  HTMLAttributes,
  ReactElement,
  ReactNode,
} from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export interface MagicCardProps extends HTMLAttributes<HTMLDivElement> {
  as?: ReactElement;
  className?: string;
  children?: ReactNode;
  size?: number;
  spotlight?: boolean;
  spotlightColor?: string;
  isolated?: boolean;
  background?: string;
  borderColor?: string;
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function MagicCard({
  children,
  className,
  size = 600,
  spotlight = true,
  borderColor = "hsl(0 0% 98%)",
  isolated = true,
  gradientSize = 300,
  gradientColor = "#262626",
  gradientOpacity = 0.9,
  ...props
}: MagicCardProps) {
  // ---------------------------------------------------------------------------
  // Motion Values
  // ---------------------------------------------------------------------------

  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const { left, top } = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - left);
      mouseY.set(e.clientY - top);
    },
    [mouseX, mouseY],
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }, [mouseX, mouseY, gradientSize]);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }, [mouseX, mouseY, gradientSize]);

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        {
          "--mask-size": `${size}px`,
          "--border-color": `${borderColor}`,
        } as CSSProperties
      }
      className={cn(
        "z-20 h-full w-full rounded-lg",
        "bg-gray-300 dark:bg-gray-700",
        "bg-[radial-gradient(var(--mask-size)_circle_at_var(--mouse-x)_var(--mouse-y),var(--border-color),transparent_100%)]",
        className,
      )}
      {...props}
    >
      <div className="relative z-10">{children}</div>
      <motion.div
        className="pointer-events-none absolute inset-[1px] rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100 "
        style={{
          background: useMotionTemplate`
            radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientColor}, transparent 100%)
          `,
          opacity: gradientOpacity,
        }}
      />
      <div className="-z-20 absolute inset-[1px] rounded-lg bg-black" />
    </div>
  );
}
