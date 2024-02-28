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

import { useIsDemoPathname } from "@lightdotso/hooks";
import { useModals } from "@lightdotso/stores";
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@lightdotso/ui";
import { PencilIcon } from "lucide-react";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const OwnerOverviewBanner: FC = () => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const isDemo = useIsDemoPathname();
  const { showOwnerModal } = useModals();

  // ---------------------------------------------------------------------------
  // Component
  // ---------------------------------------------------------------------------

  const EditButton: FC = () => {
    if (isDemo) {
      return null;
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              className="w-full md:w-28"
              onClick={() => {
                showOwnerModal();
              }}
            >
              <PencilIcon className="mr-2 size-4" />
              Edit
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit Owners</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return <EditButton />;
};
