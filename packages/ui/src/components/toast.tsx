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

"use client";

import { cn } from "@lightdotso/utils";
import { cva } from "class-variance-authority";
import { useTheme } from "next-themes";
import type { ComponentProps } from "react";
import type { ExternalToast } from "sonner";
import { toast, Toaster as SonnerToaster } from "sonner";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type ToasterProps = ComponentProps<typeof SonnerToaster>;

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------

const toastVariants = cva(
  "flex w-full items-center space-x-4 overflow-hidden rounded-md p-4 shadow-xl",
  {
    variants: {
      intent: {
        default:
          "border border-border bg-background [&>button]:data-[visible=true]:ring-border",
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

const toastMinimalLoadingStyles: ExternalToast = {
  position: "bottom-left",
  style: {
    height: "44px",
    width: "44px",
  },
};

const toastMinimalIntentStyles: ExternalToast = {
  position: "bottom-left",
  style: {
    height: "52px",
    width: "52px",
  },
};

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
          toast: cn(
            "toast group border border-border text-text",
            toastVariants({ intent: "default" }),
          ),
          title: "text-sm font-semibold text-ellipsis overflow-hidden",
          description: "text-sm opacity-90 text-ellipsis overflow-hidden",
          loader: "text-text",
          actionButton:
            "text-xs px-1.5 py-1 rounded-md group-[.toast]:bg-text-inverse group-[.toast]:ring-1 group-[.toast]:ring-border-inverse-strongest group-[.toast]:text-text-primary",
          cancelButton:
            "text-xs px-1.5 py-1 rounded-md group-[.toast]:bg-background-overlay group-[.toast]:border group-[.toast]:text-text-inverse",
          closeButton: "!hidden",
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
// Exports
// -----------------------------------------------------------------------------

export { toast, toastMinimalLoadingStyles, toastMinimalIntentStyles, Toaster };
