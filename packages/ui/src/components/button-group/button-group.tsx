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

"use client";

import { cn } from "@lightdotso/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { forwardRef } from "react";

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------

const buttonGroupVariants = cva("inline-flex -space-x-px rounded-md", {
  variants: {
    variant: {
      default: "button group p-1",
      unstyled: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

// -----------------------------------------------------------------------------
// Components
// -----------------------------------------------------------------------------

const ButtonGroup = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & VariantProps<typeof buttonGroupVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(buttonGroupVariants({ variant: variant }), className)}
    data-variant={variant ?? "default"}
    {...props}
  />
));
ButtonGroup.displayName = "ButtonGroup";

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export { ButtonGroup };
