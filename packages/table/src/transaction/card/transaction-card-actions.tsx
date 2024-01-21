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

import { Action } from "@lightdotso/const";
import type { TransactionData } from "@lightdotso/data";
import { ActionLogo } from "@lightdotso/ui";
import { useMemo, type FC } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type TransactionCardActionsProps = { transaction: TransactionData };

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TransactionCardActions: FC<TransactionCardActionsProps> = ({
  transaction: { interpretation },
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

    // Get the keys of the Action enum
    const actionKeys = Object.keys(Action).filter(key => isNaN(Number(key)));

    // Find the first action from flattenedActions that is a key in Action enum
    const matchedAction = flattenedActions.find(action =>
      actionKeys.includes(action),
    );

    // If an action is found, convert it to Action type
    return matchedAction
      ? Action[matchedAction as keyof typeof Action]
      : undefined;
  }, [interpretation?.actions]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!action) {
    return null;
  }

  return <ActionLogo action={action} />;
};
