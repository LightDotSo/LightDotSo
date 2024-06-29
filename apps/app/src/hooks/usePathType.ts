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
import type { Group } from "@lightdotso/types";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const unauthenticatedPaths = ["/activity", "/owners", "/transactions"];
const interceptionPaths = ["/notifications"];
const authenticatedPaths = [
  "/new",
  "/new/configuration",
  "/new/confirm",
  "/notifications",
  "/wallet",
  "/settings",
  "/settings",
  "/settings/account",
  "/settings/appearance",
  "/settings/display",
  "/settings/notifications",
  "/support",
  "/wallets",
];
const demoPaths = [
  "/demo",
  "/demo/activity",
  "/demo/owners",
  "/demo/overview",
  "/demo/transactions",
];

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type RootType = Group | "interception";

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const usePathType = (): RootType => {
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

  const pathType = useMemo(() => {
    if (interceptionPaths.some(path => pathname.startsWith(path)) && wallet) {
      return "interception";
    }

    if (
      unauthenticatedPaths.some(path => pathname.startsWith(path)) ||
      pathname === "/"
    ) {
      return "unauthenticated";
    }

    if (authenticatedPaths.some(path => pathname.startsWith(path))) {
      return "authenticated";
    }

    if (demoPaths.some(path => pathname.startsWith(path))) {
      return "demo";
    }

    return "wallet";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return pathType;
};
