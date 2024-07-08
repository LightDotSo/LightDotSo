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

// Heavily inspired by the badge primitives introduced by @fiveoutofnine
// Site: https://www.fiveoutofnine.com/design/component/badge
// Code: https://github.com/fiveoutofnine/www/blob/a04dd54f76f57c145155dce96744d003f0d3de5e/components/ui/badge/styles.tsx
// License: MIT

import { cn } from "@lightdotso/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-border-info focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent",
        shadow: "border",
        outline: "text-text",
        unstyled: "border-0",
      },
      intent: {
        default: [
          // Default
          ["data-[variant=default]:bg-background-primary"],
          ["data-[variant=default]:text-text-weakest"],
          // Shadow
          ["data-[variant=shadow]:border-border-primary-weaker"],
          ["data-[variant=shadow]:bg-background-primary-weakest"],
          ["data-[variant=shadow]:text-text-inverse-weakest"],
        ],
        destructive: [
          // Default
          ["data-[variant=default]:bg-background-destructive"],
          ["data-[variant=default]:text-text-inverse"],
          // Shadow
          ["data-[variant=shadow]:border-border-destructive-weaker"],
          ["data-[variant=shadow]:bg-background-destructive-weakest"],
          ["data-[variant=shadow]:text-text-destructive"],
        ],
        error: [
          // Default
          ["data-[variant=default]:bg-background-error"],
          ["data-[variant=default]:text-text-inverse"],
          // Shadow
          ["data-[variant=shadow]:border-border-error-weaker"],
          ["data-[variant=shadow]:bg-background-error-weakest"],
          ["data-[variant=shadow]:text-text-error"],
        ],
        warning: [
          // Default
          ["data-[variant=default]:bg-background-warning"],
          ["data-[variant=default]:text-text-inverse"],
          // Shadow
          ["data-[variant=shadow]:border-border-warning-weaker"],
          ["data-[variant=shadow]:bg-background-warning-weakest"],
          ["data-[variant=shadow]:text-text-warning"],
        ],
        info: [
          // Default
          ["data-[variant=default]:bg-background-info"],
          ["data-[variant=default]:text-text-inverse"],
          // Shadow
          ["data-[variant=shadow]:border-border-info-weaker"],
          ["data-[variant=shadow]:bg-background-info-weakest"],
          ["data-[variant=shadow]:text-text-info"],
        ],
        success: [
          // Default
          ["data-[variant=default]:bg-background-success"],
          ["data-[variant=default]:text-text-inverse"],
          // Shadow
          ["data-[variant=shadow]:border-border-success-weaker"],
          ["data-[variant=shadow]:bg-background-success-weakest"],
          ["data-[variant=shadow]:text-text-success"],
        ],
        indigo: [
          // Default
          ["data-[variant=default]:bg-background-indigo"],
          ["data-[variant=default]:text-text-inverse"],
          // Shadow
          ["data-[variant=shadow]:border-border-indigo-weaker"],
          ["data-[variant=shadow]:bg-background-indigo-weakest"],
          ["data-[variant=shadow]:text-text-indigo"],
        ],
        pink: [
          // Default
          ["data-[variant=default]:bg-background-pink"],
          ["data-[variant=default]:text-text-inverse"],
          // Shadow
          ["data-[variant=shadow]:border-border-pink-weaker"],
          ["data-[variant=shadow]:bg-background-pink-weakest"],
          ["data-[variant=shadow]:text-text-pink"],
        ],
        purple: [
          // Default
          ["data-[variant=default]:bg-background-purple"],
          ["data-[variant=default]:text-text-inverse"],
          // Shadow
          ["data-[variant=shadow]:border-border-purple-weaker"],
          ["data-[variant=shadow]:bg-background-purple-weakest"],
          ["data-[variant=shadow]:text-text-purple"],
        ],
      },
      size: {
        sm: "h-4 min-w-4 text-xs",
        md: "h-5 min-w-5 text-sm",
        lg: "h-6 min-w-6 text-base",
        unsized: "",
      },
      type: {
        number: [
          ["data-[number-single=false]:data-[size=sm]:px-1"],
          ["data-[number-single=false]:data-[size=md]:px-2"],
          ["data-[number-single=false]:data-[size=lg]:px-2"],
        ],
        text: [
          ["data-[size=sm]:px-1.5"],
          ["data-[size=md]:px-2"],
          ["data-[size=lg]:px-2.5"],
        ],
      },
    },
    defaultVariants: {
      variant: "default",
      intent: "default",
      size: "md",
      type: "text",
    },
  },
);

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

// -----------------------------------------------------------------------------
// Components
// -----------------------------------------------------------------------------

function Badge({
  className,
  variant,
  size,
  type,
  intent,
  children,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        badgeVariants({
          variant: variant,
          intent: intent,
          size: size,
          type: type,
        }),
        className,
      )}
      data-number-single={
        children?.toString().length === 1 && type === "number"
      }
      data-size={size ?? "md"}
      data-variant={variant ?? "default"}
      {...props}
    >
      {children}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export { Badge, badgeVariants };
