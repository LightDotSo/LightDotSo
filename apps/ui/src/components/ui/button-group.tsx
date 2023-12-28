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

"use client";

import { cn } from "@lightdotso/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { forwardRef } from "react";

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------

const buttonGroupVariants = cva("inline-flex space-x-[-1px] rounded-md", {
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
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof buttonGroupVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(buttonGroupVariants({ variant }), className)}
    data-variant={variant ?? "default"}
    {...props}
  />
));
ButtonGroup.displayName = "ButtonGroup";

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export { ButtonGroup };
