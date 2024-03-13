// Copyright 2023-2024 Light, Inc.
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

import {
  useUserOperationsQueryState,
  userOperationsParser,
} from "@lightdotso/nuqs";
import { useAuth, useFormRef } from "@lightdotso/stores";
import { FooterButton } from "@lightdotso/templates";
import { useRouter } from "next/navigation";
import { useMemo, type FC, useCallback } from "react";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const ModalInterceptionFooter: FC = () => {
  // ---------------------------------------------------------------------------
  // Query State Hooks
  // ---------------------------------------------------------------------------

  const [userOperations] = useUserOperationsQueryState();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { wallet } = useAuth();
  const { isFormDisabled } = useFormRef();

  // ---------------------------------------------------------------------------
  // Next Hooks
  // ---------------------------------------------------------------------------

  const router = useRouter();

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  const onDismiss = useCallback(() => {
    router.back();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const href = useMemo(() => {
    return `/${wallet}/create?userOperations=${userOperationsParser.serialize(userOperations)}`;
  }, [wallet, userOperations]);

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  const onClick = useCallback(() => {
    router.push(href ?? `${wallet}/create`);
  }, [href, router, wallet]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <FooterButton
      isModal
      className="pt-0"
      cancelClick={onDismiss}
      disabled={isFormDisabled}
      onClick={onClick}
    />
  );
};
