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

import { INTERCEPTION_PATHS } from "@/const";
import { getAppGroup } from "@/utils";
import { useAuth } from "@lightdotso/stores";
import type { AppGroup } from "@lightdotso/types";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useAppGroup = (): AppGroup => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { wallet } = useAuth();

  // ---------------------------------------------------------------------------
  // Next Hooks
  // ---------------------------------------------------------------------------

  const pathname = usePathname();

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const appGroup = useMemo(() => {
    if (
      INTERCEPTION_PATHS.some((path) => pathname.startsWith(path)) &&
      wallet
    ) {
      return "interception";
    }

    return getAppGroup(pathname);
  }, [pathname]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return appGroup;
};
