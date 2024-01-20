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
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { forwardRef } from "react";
import { badgeVariants } from "./badge";

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------

export const badgeIconVariants = cva(["rounded-md"], {
  variants: {
    shape: {
      rounded: "rounded-full",
      default: "",
    },
    size: {
      sm: "size-6",
      md: "size-8",
      lg: "size-10",
      unsized: "",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface BadgeIconProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants>,
    VariantProps<typeof badgeIconVariants> {
  asChild?: boolean;
}

// -----------------------------------------------------------------------------
// Components
// -----------------------------------------------------------------------------

const BadgeIcon = forwardRef<HTMLDivElement, BadgeIconProps>(
  (
    { className, variant, intent, size, shape, asChild = false, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "div";

    return (
      <Comp
        ref={ref}
        className={cn(
          badgeVariants({
            variant,
            intent,
            size,
            className,
          }),
          badgeIconVariants({ size, shape }),
        )}
        data-variant={variant ?? "default"}
        {...props}
      />
    );
  },
);
BadgeIcon.displayName = "BadgeIcon";

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export { BadgeIcon, badgeVariants };
