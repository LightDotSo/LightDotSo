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

import { useAuth } from "@lightdotso/stores";
import { useFlag } from "@upstash/edge-flags";
import { useMemo } from "react";

// From: https://github.com/shadcn-ui/ui/blob/fb614ac2921a84b916c56e9091aa0ae8e129c565/apps/www/hooks/use-media-query.tsx#L4
// License: MIT

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export function useEdgeFlag(flagName: string) {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { address, userId } = useAuth();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const options = useMemo(
    () => ({
      address: address ?? "",
      userId: userId ?? "",
    }),
    [address, userId],
  );

  // ---------------------------------------------------------------------------
  // Edge Flag Hooks
  // ---------------------------------------------------------------------------

  const { isEnabled, isLoading, error } = useFlag(`app-${flagName}`, options);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return { isEnabled, isLoading, error };
}
