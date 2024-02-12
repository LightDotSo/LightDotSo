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

import {
  transfersParser,
  useTransfersQueryState,
  useUserOperationsQueryState,
  userOperationsParser,
} from "@lightdotso/nuqs";
import { useAuth, useFormRef, useModals } from "@lightdotso/stores";
import { FooterButton } from "@lightdotso/templates";
import { useRouter } from "next/navigation";
import { useMemo, type FC, useCallback, useState, useEffect } from "react";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const ModalInterceptionFooter: FC = () => {
  // ---------------------------------------------------------------------------
  // Nuqs
  // ---------------------------------------------------------------------------

  const [transfers] = useTransfersQueryState();
  const [userOperations] = useUserOperationsQueryState();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { wallet } = useAuth();
  const { isFormDisabled } = useFormRef();
  const { hideSendModal } = useModals();

  // ---------------------------------------------------------------------------
  // Next Hooks
  // ---------------------------------------------------------------------------

  const router = useRouter();

  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [footerHref, setFooterHref] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  const onDismiss = useCallback(() => {
    hideSendModal();
    router.back();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const href = useMemo(() => {
    return `/${wallet}/create?userOperations=${userOperationsParser.serialize(userOperations)}&transfers=${transfersParser.serialize(transfers)}`;
  }, [wallet, userOperations, transfers]);

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  const onClick = useCallback(() => {
    router.push(footerHref ?? "/create");
  }, [footerHref, router]);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    setFooterHref(href);
  }, [href, setFooterHref]);
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
