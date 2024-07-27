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

"use client";

import { useIsMounted } from "@lightdotso/hooks";
import { useAuth, useComboDialogs } from "@lightdotso/stores";
import { Button } from "@lightdotso/ui";
import { Megaphone } from "lucide-react";
import type { FC } from "react";
import { ComboDialog } from "../combo-dialog";
import { FeedbackForm } from "./feedback-form";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const FeedbackComboDialog: FC = () => {
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const isMounted = useIsMounted();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { address } = useAuth();
  const { isFeedbackComboDialogOpen, toggleIsFeedbackComboDialogOpen } =
    useComboDialogs();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // If the address is empty, return null
  if (!(isMounted && address)) {
    return null;
  }

  return (
    <ComboDialog
      className="w-80 p-0"
      contentClassName="p-0 py-4"
      buttonTrigger={
        <Button variant="outline" className="px-2">
          <Megaphone className="mr-2 size-4 shrink-0" />
          Feedback
          <span className="sr-only">Open popover</span>
        </Button>
      }
      isOpen={isFeedbackComboDialogOpen}
      onOpenChange={toggleIsFeedbackComboDialogOpen}
    >
      <FeedbackForm onClose={toggleIsFeedbackComboDialogOpen} />
    </ComboDialog>
  );
};
