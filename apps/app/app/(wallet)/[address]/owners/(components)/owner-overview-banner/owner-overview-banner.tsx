// Copyright 2023-2024 Light
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
import { useQueryConfiguration } from "@lightdotso/query";
import { useAuth, useModals } from "@lightdotso/stores";
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@lightdotso/ui";
import { PencilIcon } from "lucide-react";
import type { FC } from "react";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const OwnerOverviewBanner: FC = () => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const isDemo = useIsDemoPathname();
  const { isOwnerModalVisible, showOwnerModal, setOwnerModalProps } =
    useModals();
  const { wallet } = useAuth();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { configuration } = useQueryConfiguration({
    address: wallet,
  });

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
              disabled={isOwnerModalVisible}
              type="button"
              className="w-full md:w-28"
              onClick={() => {
                setOwnerModalProps({
                  initialOwners: configuration?.owners
                    ? configuration?.owners.map(owner => {
                        return {
                          address: owner.address as Address,
                          addressOrEns: owner.address,
                          weight: owner.weight,
                        };
                      })
                    : [],
                  initialThreshold: configuration?.threshold ?? 1,
                  onOwnerSelect: () => {},
                });

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
