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

import {
  ButtonIcon,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@lightdotso/ui";
import { cn } from "@lightdotso/utils";
import { RefreshCcw } from "lucide-react";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface InvokeButtonProps {
  isLoading?: boolean;
  onClick: () => void;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const InvokeButton: FC<InvokeButtonProps> = ({ onClick, isLoading }) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <ButtonIcon
              size="sm"
              className={cn(isLoading && "text-text-weaker")}
              disabled={isLoading}
              variant="shadow"
              onClick={onClick}
            >
              {!isLoading ? (
                <RefreshCcw className="size-3" />
              ) : (
                <div className="duration-[50ms] flex items-center justify-center space-x-1">
                  <div className="size-1 animate-bounce rounded-full bg-background-primary [animation-delay:-300ms]" />
                  <div className="size-1 animate-bounce rounded-full bg-background-primary-weak [animation-delay:-150ms]" />
                  <div className="size-1 animate-bounce rounded-full bg-background-primary" />
                </div>
              )}
            </ButtonIcon>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Refresh</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
