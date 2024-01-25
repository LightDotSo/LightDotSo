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

import type { UserOperationData } from "@lightdotso/data";
import { cn } from "@lightdotso/utils";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type UserOperationCardStatusProps = { userOperation: UserOperationData };

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const UserOperationCardStatus: FC<UserOperationCardStatusProps> = ({
  userOperation: { status },
}) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      className={cn(
        "flex items-center justify-end text-right text-sm md:text-base",
        status === "EXECUTED"
          ? "text-text-success"
          : status === "PROPOSED"
            ? "text-text-indigo"
            : status === "PENDING"
              ? "text-text-info"
              : status === "INVALID"
                ? "text-text-destructive"
                : status === "REVERTED"
                  ? "text-text-error"
                  : "text-text-error",
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
    </div>
  );
};
