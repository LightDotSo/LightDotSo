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

// Heavily inspired by the button primitives introduced by @fiveoutofnine
// Site: https://www.fiveoutofnine.com/design/component/button
// Code: https://github.com/fiveoutofnine/www/blob/a04dd54f76f57c145155dce96744d003f0d3de5e/components/ui/button/styles.tsx
// License: MIT

import { cn } from "@lightdotso/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { forwardRef } from "react";
import { buttonVariants } from "./button";

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------

const buttonIconVariants = cva([], {
  variants: {
    size: {
      default: "w-9",
      xs: "w-6",
      sm: "w-8",
      lg: "w-10",
      unsized: "",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface ButtonIconProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

// -----------------------------------------------------------------------------
// Components
// -----------------------------------------------------------------------------

const ButtonIcon = forwardRef<HTMLButtonElement, ButtonIconProps>(
  ({ className, variant, intent, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(
          buttonVariants({
            variant,
            intent,
            size,
            className,
          }),
          buttonIconVariants({ size }),
        )}
        data-variant={variant ?? "default"}
        {...props}
      />
    );
  },
);
ButtonIcon.displayName = "ButtonIcon";

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export { ButtonIcon, buttonVariants };
