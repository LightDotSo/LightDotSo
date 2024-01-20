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
import { ActionLogo } from "@lightdotso/ui";
import type { TransactionData } from "@lightdotso/data";
import { useMemo, type FC } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type TransactionCardActionsProps = { transaction: TransactionData };

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TransactionCardActions: FC<TransactionCardActionsProps> = ({
  transaction: { actions },
}) => {
  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  // Get the first matching action from the `Action` enum
  const action: Action | undefined = useMemo(() => {
    // Convert actions to a set for efficient lookup
    const actionSet = new Set(actions);

    // Get the first matching action from the `Action` enum which is not numeric
    return Object.keys(Action)
      .filter(action => isNaN(Number(action)))
      .find(action => actionSet.has(action)) as Action | undefined;
  }, [actions]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return <ActionLogo action={action ?? Action.ERC20_RECEIVE} />;
};
