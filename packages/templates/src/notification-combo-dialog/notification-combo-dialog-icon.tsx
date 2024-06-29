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

import { BadgeIcon, ButtonIcon } from "@lightdotso/ui";
import { BellIcon } from "lucide-react";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export interface NotificationComboDialogIconProps {
  notificationsCount: number | null | undefined;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const NotificationComboDialogIcon: FC<
  NotificationComboDialogIconProps
> = ({ notificationsCount }) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="relative">
      <ButtonIcon variant="outline">
        <BellIcon className="size-4" />
        <span className="sr-only">Open notificaitons</span>
      </ButtonIcon>
      {(notificationsCount || notificationsCount === 0) &&
        notificationsCount !== 0 && (
          <BadgeIcon
            intent="info"
            className="absolute -bottom-1.5 -right-1.5 size-1 p-2"
            size="unsized"
            type="number"
          >
            {notificationsCount > 99 ? "99+" : notificationsCount}
          </BadgeIcon>
        )}
    </div>
  );
};
