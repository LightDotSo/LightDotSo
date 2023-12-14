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
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-border-info focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-background-primary text-text-weakest hover:bg-background-primary/80",
        destructive:
          "border-transparent bg-background-destructive text-text-inverse hover:bg-background-destructive/80",
        warning:
          "border-transparent bg-background-warning text-text-inverse hover:bg-background-warning/80",
        error:
          "border-transparent bg-background-error text-text-inverse hover:bg-background-error/80",
        info: "border-transparent bg-background-info text-text-inverse hover:bg-background-info/80",
        outline: "text-text",
        unstyled: "border-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
