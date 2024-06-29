// Copyright 2023-2024 Light.
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

  return { isEnabled: isEnabled, isLoading: isLoading, error: error };
}
