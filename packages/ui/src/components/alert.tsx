// Copyright 2023-2024 Light, Inc.
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

import { cn } from "@lightdotso/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { forwardRef } from "react";

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&:has(svg)]:pl-11 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-text",
  {
    variants: {
      variant: {
        default: "",
      },
      intent: {
        default: "bg-background text-text",
        destructive:
          "border-border-destructive text-text-destructive [&>svg]:text-text-destructive",
        error: "border-border-error text-text-error [&>svg]:text-text-error",
        warning:
          "border-border-warning text-text-warning [&>svg]:text-text-warning",
        info: "border-border-info text-text-info [&>svg]:text-text-info",
        success:
          "border-border-success text-text-success [&>svg]:text-text-success",
      },
    },
    defaultVariants: {
      variant: "default",
      intent: "default",
    },
  },
);

// -----------------------------------------------------------------------------
// Components
// -----------------------------------------------------------------------------

const Alert = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, intent, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(
      alertVariants({ variant: variant, intent: intent }),
      className,
    )}
    data-variant={variant ?? "default"}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  // eslint-disable-next-line jsx-a11y/heading-has-content
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export { Alert, AlertTitle, AlertDescription };
