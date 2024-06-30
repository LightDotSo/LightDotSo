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

import { BadgeIcon, ButtonIcon } from "@lightdotso/ui";
import type { FC, ReactNode } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export interface BadgeCountButtonProps {
  children: ReactNode;
  count: number | null | undefined;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const BadgeCountButton: FC<BadgeCountButtonProps> = ({
  children,
  count,
}) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="relative">
      <ButtonIcon variant="outline">
        {children}
        <span className="sr-only">Open</span>
      </ButtonIcon>
      {(count || count === 0) && count !== 0 && (
        <BadgeIcon
          intent="info"
          className="absolute -bottom-1.5 -right-1.5 size-1 p-2"
          size="unsized"
          type="number"
        >
          {count > 99 ? "99+" : count}
        </BadgeIcon>
      )}
    </div>
  );
};
