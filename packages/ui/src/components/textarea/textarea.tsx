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

import { cn } from "@lightdotso/utils";
import type { TextareaHTMLAttributes } from "react";
import { forwardRef } from "react";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

// -----------------------------------------------------------------------------
// Components
// -----------------------------------------------------------------------------

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm placeholder:text-text-weak focus:z-50 focus:outline-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-info disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export { Textarea };
