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

import { Badge } from "@lightdotso/ui";
import type { FC } from "react";
import type { UserOperationData } from "@/data";

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
    <div className="group flex items-center space-x-1.5">
      <Badge
        variant="shadow"
        intent={
          status === "EXECUTED"
            ? "success"
            : status === "PROPOSED"
              ? "warning"
              : status === "PENDING"
                ? "info"
                : status === "INVALID"
                  ? "destructive"
                  : status === "REVERTED"
                    ? "error"
                    : "error"
        }
      >
        {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
      </Badge>
    </div>
  );
};
