// Copyright 2023-2024 Light.
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
  TooltipProvider,
  TooltipTrigger,
} from "@lightdotso/ui";
import { InfoIcon } from "lucide-react";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type NotAvailableTestnetCardProps = { entityName: string };

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const NotAvailableTestnetCard: FC<NotAvailableTestnetCardProps> = ({
  entityName,
}) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-row items-center space-x-1">
      <span className="text-sm text-text-weak">N/A</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <ButtonIcon disabled size="xxs" variant="link">
              <InfoIcon className="size-3" />
            </ButtonIcon>
          </TooltipTrigger>
          <TooltipContent>{entityName} not available on testnet</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
