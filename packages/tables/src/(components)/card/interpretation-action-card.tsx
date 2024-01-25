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

import { ACTION_LABELS, Action } from "@lightdotso/const";
import type { InterpretationData } from "@lightdotso/data";
import { ActionLogo } from "@lightdotso/elements";
import { useMemo, type FC } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type InterpretationActionCardProps = {
  interpretation?: InterpretationData | null;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const InterpretationActionCard: FC<InterpretationActionCardProps> = ({
  interpretation,
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
    const flattenedActions = interpretation?.actions.map(a => a.action);

    // Find the first action from flattenedActions that is a key in Action enum
    const matchedActionKey = flattenedActions.find(action =>
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
    return <div className="w-32" />;
  }

  return (
    <div className="flex max-w-32 items-center space-x-3">
      <ActionLogo action={action} />
      <span className="text-xs font-medium text-text md:text-sm ">
        {ACTION_LABELS[action]}
      </span>
    </div>
  );
};
