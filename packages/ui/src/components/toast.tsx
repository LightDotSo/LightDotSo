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
import { useTheme } from "next-themes";
import type { ComponentProps } from "react";
import { toast, Toaster as SonnerToaster } from "sonner";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type ToasterProps = ComponentProps<typeof SonnerToaster>;

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------

const toastVariants = cva(
  "pointer-events-auto relative flex w-full items-center space-x-4 overflow-hidden rounded-md border p-4 shadow-xl transition-all",
  {
    variants: {
      intent: {
        default:
          "border bg-background [&>button]:data-[visible=true]:ring-border",
        destructive:
          "border-4 border-border-destructive-weaker bg-background-destructive text-text-inverse [&>button]:data-[type=destructive]:bg-background-destructive [&>button]:data-[type=destructive]:ring-border-destructive-weak",
        success:
          "border-4 border-border-success-weaker bg-background-success text-text-inverse [&>button]:data-[type=success]:bg-background-success [&>button]:data-[type=success]:ring-border-success-weak",
        info: "border-4 border-border-info-weaker bg-background-info text-text-inverse [&>button]:data-[type=info]:bg-background-info [&>button]:data-[type=info]:ring-border-info-weak",
        warning:
          "border-4 border-border-warning-weaker bg-background-warning text-text-inverse [&>button]:data-[type=warning]:bg-background-warning [&>button]:data-[type=warning]:ring-border-warning-weak",
      },
    },
    defaultVariants: {
      intent: "default",
    },
  },
);

// -----------------------------------------------------------------------------
// Components
// -----------------------------------------------------------------------------

const Toaster = () => {
  const { theme } = useTheme();

  return (
    <SonnerToaster
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: cn("toast group", toastVariants({ intent: "default" })),
          title: "text-sm font-semibold text-ellipsis overflow-hidden",
          description: "text-sm opacity-90 text-ellipsis overflow-hidden",
          loader: "text-text",
          actionButton: "group-[.toast]:ring-1",
          cancelButton:
            "group-[.toast]:border group-[.toast]:text-text-inverse",
          success: toastVariants({ intent: "success" }),
          error: toastVariants({ intent: "destructive" }),
          info: toastVariants({ intent: "info" }),
          warning: toastVariants({ intent: "warning" }),
        },
      }}
    />
  );
};

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const errorToast = (err: string) => toast.error(err);

const successToast = (data: any) => toast.success(data);

const infoToast = (title: string) => toast.info(title);

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export { toast, Toaster, errorToast, successToast, infoToast };
