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

import { useAppGroup } from "@/hooks";
import { useAuth, useModals } from "@lightdotso/stores";
import { BadgeCountButton } from "@lightdotso/templates";
import { ShoppingCartIcon } from "lucide-react";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const CartBadgeCountButton: FC = () => {
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const appGroup = useAppGroup();
  const { showCartModal } = useModals();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { wallet } = useAuth();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // If the address is empty, and the path type is not "demo", return null.
  if (!wallet && appGroup !== "demo") {
    return null;
  }

  return (
    <BadgeCountButton onClick={showCartModal} count={0}>
      <ShoppingCartIcon className="size-4" />
    </BadgeCountButton>
  );
};
