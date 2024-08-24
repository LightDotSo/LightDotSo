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

// Heavily inspired by the button primitives introduced by @fiveoutofnine
// Site: https://www.fiveoutofnine.com/design/component/button
// Code: https://github.com/fiveoutofnine/www/blob/a04dd54f76f57c145155dce96744d003f0d3de5e/components/ui/button/styles.tsx
// License: MIT

import { cn } from "@lightdotso/utils";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { forwardRef } from "react";
import { buttonVariants } from "../button";

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------

export const buttonIconVariants = cva(["px-0"], {
  variants: {
    size: {
      default: "w-9",
      xxs: "w-4",
      xs: "w-6",
      sm: "w-8",
      lg: "w-10",
      xl: "w-12",
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
            variant: variant,
            intent: intent,
            size: size,
            className: className,
          }),
          buttonIconVariants({ size: size }),
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
