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
  isLoading: boolean;
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
              className={cn(isLoading && "text-text-weaker")}
              disabled={isLoading}
              variant="shadow"
              onClick={onClick}
            >
              {!isLoading ? (
                <RefreshCcw className="size-4" />
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
