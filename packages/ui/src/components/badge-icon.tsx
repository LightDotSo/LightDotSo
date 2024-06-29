// Copyright 2023-2024 Light.
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
            variant: variant,
            intent: intent,
            size: size,
            className: className,
          }),
          badgeIconVariants({ size: size, shape: shape }),
          className,
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
