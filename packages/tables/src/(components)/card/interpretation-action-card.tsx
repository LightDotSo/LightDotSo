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

import { ACTION_LABELS, Action } from "@lightdotso/const";
import type { InterpretationData } from "@lightdotso/data";
import { ActionLogo } from "@lightdotso/elements";
import { cn } from "@lightdotso/utils";
import { type FC, useMemo } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type InterpretationActionCardProps = {
  interpretation?: InterpretationData | null;
  className?: string;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const InterpretationActionCard: FC<InterpretationActionCardProps> = ({
  interpretation,
  className,
}) => {
  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  // Get the first matching action from the `Action` enum
  const action: Action | undefined = useMemo(() => {
    if (!interpretation?.actions) {
      return undefined;
    }

    // Flatten actions to just be an array of action keys
    const flattenedActions = interpretation?.actions.map((a) => a.action);

    // Find the first action from flattenedActions that is a key in Action enum
    const matchedActionKey = flattenedActions.find((action) =>
      Object.values(Action).includes(action),
    );

    // If an action is found, convert it to Action type
    return matchedActionKey !== undefined
      ? Action[matchedActionKey as keyof typeof Action]
      : undefined;
  }, [interpretation?.actions]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!action) {
    return <div className={cn("min-w-20", className)} />;
  }

  return (
    <div className={cn("flex min-w-20 items-center space-x-3", className)}>
      <ActionLogo action={action} />
      <span className="font-medium text-text text-xs md:text-sm ">
        {ACTION_LABELS[action]}
      </span>
    </div>
  );
};
