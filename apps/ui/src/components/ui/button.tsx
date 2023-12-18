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

import { cn } from "@lightdotso/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-info focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border",
        shadow: "",
        outline: "border",
        ghost: "",
        link: "underline-offset-4 hover:underline",
        strong: "",
        loading: "",
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
          // Shadow
          ["data-[variant=shadow]:bg-background-stronger"],
          ["data-[variant=shadow]:text-text-primary"],
          ["data-[variant=shadow]:hover:bg-background-strongest"],
          // Outline
          ["data-[variant=outline]:border-border-primary-weak"],
          ["data-[variant=outline]:bg-background"],
          ["data-[variant=outline]:text-text"],
          ["data-[variant=outline]:hover:bg-background-stronger"],
          ["data-[variant=outline]:hover:text-text-weak"],
          // Ghost
          ["data-[variant=ghost]:hover:bg-background-stronger"],
          ["data-[variant=ghost]:hover:text-text-weak"],
          // Link
          ["data-[variant=link]:text-text"],
          // Strong
          ["data-[variant=strong]:bg-background-stronger"],
          ["data-[variant=strong]:text-text"],
          ["data-[variant=strong]:hover:bg-background-stronger/90"],
          ["data-[variant=strong]:hover:text-text-weak"],
          // Loading
          ["data-[variant=loading]:bg-background-primary-strong"],
          ["data-[variant=loading]:hover:bg-background-primary/90"],
          ["data-[variant=loading]:text-text-weakest"],
        ],
        destructive: [
          // Default
          ["data-[variant=default]:border-border-destructive-weak"],
          ["data-[variant=default]:bg-background-destructive"],
          ["data-[variant=default]:text-text-inverse"],
          ["data-[variant=default]:hover:border-border-destructive-weaker"],
          ["data-[variant=default]:hover:bg-background-destructive/90"],
          // Shadow
          ["data-[variant=shadow]:bg-background-destructive-weak"],
          ["data-[variant=shadow]:text-text-destructive-strong"],
          ["data-[variant=shadow]:hover:bg-background-destructive-weaker"],
          // Outline
          ["data-[variant=outline]:border-border-destructive-weak"],
          ["data-[variant=outline]:bg-background-destructive"],
          ["data-[variant=outline]:text-text"],
          ["data-[variant=outline]:hover:bg-background-destructive-stronger"],
          ["data-[variant=outline]:hover:text-text-weak"],
          // Ghost
          ["data-[variant=ghost]:text-text-destructive"],
          ["data-[variant=ghost]:hover:bg-background-destructive-stronger"],
          ["data-[variant=ghost]:hover:text-text-destructive-weak"],
          // Link
          ["data-[variant=link]:text-text-destructive"],
          // Strong
          ["data-[variant=strong]:bg-background-destructive-stronger"],
          ["data-[variant=strong]:hover:bg-background-destructive-stronger/90"],
          ["data-[variant=strong]:hover:text-text-weak"],
          // Loading
          ["data-[variant=loading]:bg-background-destructive-strong"],
          ["data-[variant=loading]:hover:bg-background-destructive/90"],
          ["data-[variant=loading]:text-text-weakest"],
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
          className={cn(buttonVariants({ variant, intent, size, className }))}
          data-variant={variant}
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
        className={cn(buttonVariants({ variant, intent, size, className }))}
        data-variant={variant}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
