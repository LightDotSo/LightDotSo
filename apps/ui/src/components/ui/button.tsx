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
import { Loader2 } from "lucide-react";
import { forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-info focus-visible:ring-offset-2 active:ring-2 disabled:cursor-not-allowed disabled:opacity-30 disabled:ring-0",
  {
    variants: {
      variant: {
        default: "border",
        shadow: "",
        outline: "border",
        ghost: "",
        link: "underline-offset-4 hover:underline",
        loading: "cursor-wait",
        unstyled: "",
      },
      intent: {
        default: [
          // Default
          ["data-[variant=default]:border-border-primary-weak"],
          ["data-[variant=default]:bg-background-primary"],
          ["data-[variant=default]:text-text-weakest"],
          ["data-[variant=default]:hover:border-border-primary-weaker"],
          ["data-[variant=default]:hover:bg-background-primary-weak"],
          ["data-[variant=default]:active:bg-background-primary-weaker"],
          ["data-[variant=default]:active:ring-light"],
          // Shadow
          ["data-[variant=shadow]:bg-background-stronger"],
          ["data-[variant=shadow]:text-text-primary"],
          ["data-[variant=shadow]:hover:bg-background-strongest"],
          ["data-[variant=shadow]:active:ring-light"],
          // Outline
          ["data-[variant=outline]:border-border-primary-weak"],
          ["data-[variant=outline]:text-text"],
          ["data-[variant=outline]:active:border-border-primary"],
          ["data-[variant=outline]:hover:border-border-primary"],
          ["data-[variant=outline]:active:border-light"],
          ["data-[variant=outline]:active:ring-0"],
          // Ghost
          ["data-[variant=ghost]:text-text"],
          ["data-[variant=ghost]:hover:text-text-weak"],
          ["data-[variant=ghost]:hover:bg-background-stronger"],
          ["data-[variant=ghost]:active:ring-light"],
          // Link
          ["data-[variant=link]:text-text"],
          // Loading
          ["data-[variant=loading]:bg-background-primary-strong"],
          ["data-[variant=loading]:text-text-weakest"],
          ["data-[variant=loading]:hover:bg-background-primary-weak"],
          ["data-[variant=loading]:active:ring-light"],
        ],
        destructive: [
          // Default
          ["data-[variant=default]:border-border-destructive-weak"],
          ["data-[variant=default]:bg-background-destructive"],
          ["data-[variant=default]:text-text-inverse"],
          ["data-[variant=default]:hover:border-border-destructive-weaker"],
          ["data-[variant=default]:hover:bg-background-destructive-weak"],
          ["data-[variant=default]:active:ring-border-destructive-weaker"],
          // Shadow
          ["data-[variant=shadow]:bg-background-destructive-weak"],
          ["data-[variant=shadow]:text-text-destructive-strong"],
          ["data-[variant=shadow]:hover:bg-background-destructive-weaker"],
          ["data-[variant=shadow]:active:ring-destructive-weak"],
          ["data-[variant=shadow]:active:ring-border-destructive-weaker"],
          // Outline
          ["data-[variant=outline]:border-border-destructive-weak"],
          ["data-[variant=outline]:text-text-destructive"],
          ["data-[variant=outline]:active:border-border-destructive-stronger"],
          ["data-[variant=outline]:hover:border-border-destructive-stronger"],
          ["data-[variant=outline]:active:border-border-destructive-weaker"],
          ["data-[variant=outline]:active:ring-0"],
          // Ghost
          ["data-[variant=ghost]:text-text-destructive"],
          ["data-[variant=ghost]:hover:text-text-destructive-strong"],
          ["data-[variant=ghost]:hover:bg-background-destructive-weaker"],
          ["data-[variant=ghost]:active:ring-border-destructive-weaker"],
          // Link
          ["data-[variant=link]:text-text-destructive"],
          // Loading
          ["data-[variant=loading]:bg-background-destructive-strong"],
          ["data-[variant=loading]:text-text-inverse"],
          ["data-[variant=loading]:hover:bg-background-destructive-weak"],
          ["data-[variant=loading]:active:ring-border-destructive-weaker"],
        ],
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        unsized: "",
      },
    },
    defaultVariants: {
      variant: "default",
      intent: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, intent, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    if (variant === "loading" && !asChild) {
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
          )}
          data-variant={variant ?? "default"}
          {...props}
        >
          <>
            {variant === "loading" && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {props.children}
          </>
        </Comp>
      );
    }

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
        )}
        data-variant={variant ?? "default"}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
