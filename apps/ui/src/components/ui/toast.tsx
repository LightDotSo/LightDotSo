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
import { cva } from "class-variance-authority";
import { toast, Toaster as SonnerToaster } from "sonner";
import { buttonVariants } from "./button";

const toastVariants = cva(
  "pointer-events-auto relative flex w-full items-center space-x-4 overflow-hidden rounded-md border p-4 shadow-xl transition-all",
  {
    variants: {
      variant: {
        default: "border bg-background",
        destructive:
          "destructive group border-4 border-border-destructive-weaker bg-background-destructive text-text-inverse",
        success:
          "success group border-4 border-border-success-weaker bg-background-success text-text-inverse",
        info: "info group border-4 border-border-info-weaker bg-background-info text-text-inverse",
        warning:
          "warning group border-4 border-border-warning-weaker bg-background-warning text-text-inverse",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Toaster = () => {
  return (
    <SonnerToaster
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: toastVariants({ variant: "default" }),
          title: "text-sm font-semibold text-ellipsis overflow-hidden",
          description: "text-sm opacity-90 text-ellipsis overflow-hidden",
          // cancelButton: buttonVariants({ variant: "outline" }),
          // closeButton: buttonVariants({ variant: "outline" }),
          actionButton: cn(
            buttonVariants({ variant: "outline" }),
            "bg-white, border-border-inverse text-text-inverse",
          ),
          success: toastVariants({ variant: "success" }),
          error: toastVariants({ variant: "destructive" }),
          info: toastVariants({ variant: "info" }),
          warning: toastVariants({ variant: "warning" }),
        },
      }}
    />
  );
};

export { toast, Toaster };
