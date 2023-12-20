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

// Heavily inspired by the badge primitives introduced by @fiveoutofnine
// Site: https://www.fiveoutofnine.com/design/component/badge
// Code: https://github.com/fiveoutofnine/www/blob/a04dd54f76f57c145155dce96744d003f0d3de5e/components/ui/badge/styles.tsx
// License: MIT

import { cn } from "@lightdotso/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-border-info focus:ring-offset-2",
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
          ["data-[variant=shadow]:border-border-primary"],
          ["data-[variant=shadow]:bg-background-primary-weakest"],
          ["data-[variant=shadow]:text-text-inverse-weakest"],
        ],
        destructive: [
          // Default
          ["data-[variant=default]:bg-background-destructive"],
          ["data-[variant=default]:text-text-inverse"],
          // Shadow
          ["data-[variant=shadow]:border-border-destructive"],
          ["data-[variant=shadow]:bg-background-destructive-weakest"],
          ["data-[variant=shadow]:text-text-destructive"],
        ],
        error: [
          // Default
          ["data-[variant=default]:bg-background-error"],
          ["data-[variant=default]:text-text-inverse"],
          // Shadow
          ["data-[variant=shadow]:border-border-error"],
          ["data-[variant=shadow]:bg-background-error-weakest"],
          ["data-[variant=shadow]:text-text-error"],
        ],
        warning: [
          // Default
          ["data-[variant=default]:bg-background-warning"],
          ["data-[variant=default]:text-text-inverse"],
          // Shadow
          ["data-[variant=shadow]:border-border-warning"],
          ["data-[variant=shadow]:bg-background-warning-weakest"],
          ["data-[variant=shadow]:text-text-warning"],
        ],
        info: [
          // Default
          ["data-[variant=default]:bg-background-info"],
          ["data-[variant=default]:text-text-inverse"],
          // Shadow
          ["data-[variant=shadow]:border-border-info"],
          ["data-[variant=shadow]:bg-background-info-weakest"],
          ["data-[variant=shadow]:text-text-info"],
        ],
        success: [
          // Default
          ["data-[variant=default]:bg-background-success"],
          ["data-[variant=default]:text-text-inverse"],
          // Shadow
          ["data-[variant=shadow]:border-border-success"],
          ["data-[variant=shadow]:bg-background-success-weakest"],
          ["data-[variant=shadow]:text-text-success"],
        ],
      },
    },
    defaultVariants: {
      variant: "default",
      intent: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, intent, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, intent }), className)}
      data-variant={variant ?? "default"}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
