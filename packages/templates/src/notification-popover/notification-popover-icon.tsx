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

import { ButtonIcon } from "@lightdotso/ui";
import { BellIcon } from "lucide-react";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export interface NotificationPopoverIconProps {
  notificationsCount: number | null | undefined;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const NotificationPopoverIcon: FC<NotificationPopoverIconProps> = ({
  notificationsCount,
}) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="relative">
      <ButtonIcon variant="outline" className="rounded-full">
        <BellIcon className="size-4" />
        <span className="sr-only">Open notificaitons</span>
      </ButtonIcon>
      {notificationsCount && notificationsCount > 0 && (
        <span className="absolute bottom-0 right-0 transform translate-x-1/5 translate-y-1/5 w-2 h-2 rounded-full bg-background-info"></span>
      )}
    </div>
  );
};
