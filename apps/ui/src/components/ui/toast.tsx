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

import { cva } from "class-variance-authority";
import { toast, Toaster as SonnerToaster } from "sonner";
import { buttonVariants } from "./button";

const toastVariants = cva(
  "pointer-events-auto relative flex w-full items-center space-x-4 overflow-hidden rounded-md border p-4 shadow-xl transition-all",
  {
    variants: {
      intent: {
        default: "border bg-background",
        destructive:
          "border-4 border-border-destructive-weaker bg-background-destructive text-text-inverse",
        success:
          "border-4 border-border-success-weaker bg-background-success text-text-inverse",
        info: "border-4 border-border-info-weaker bg-background-info text-text-inverse",
        warning:
          "border-4 border-border-warning-weaker bg-background-warning text-text-inverse",
      },
    },
    defaultVariants: {
      intent: "default",
    },
  },
);

const Toaster = () => {
  return (
    <SonnerToaster
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: toastVariants({ intent: "default" }),
          title: "text-sm font-semibold text-ellipsis overflow-hidden",
          description: "text-sm opacity-90 text-ellipsis overflow-hidden",
          loader: "text-text",
          // cancelButton: buttonVariants({ variant: "outline" }),
          // closeButton: buttonVariants({ variant: "outline" }),
          actionButton: buttonVariants({ variant: "outline" }),
          success: toastVariants({ intent: "success" }),
          error: toastVariants({ intent: "destructive" }),
          info: toastVariants({ intent: "info" }),
          warning: toastVariants({ intent: "warning" }),
        },
      }}
    />
  );
};

export { toast, Toaster };
