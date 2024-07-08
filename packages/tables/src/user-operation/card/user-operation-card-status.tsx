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
        "text-right text-sm",
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
