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

import { useUserOperationCreate } from "@lightdotso/hooks";
import {
  useUserOperationsIndexQueryState,
  useUserOperationsQueryState,
} from "@lightdotso/nuqs";
import { useQueryConfiguration } from "@lightdotso/query";
import { useFormRef, useModals } from "@lightdotso/stores";
import { FooterButton } from "@lightdotso/templates";
import { useRouter } from "next/navigation";
import { type FC, useCallback } from "react";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type ModalInterceptionFooterProps = {
  address: Address;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const ModalInterceptionFooter: FC<ModalInterceptionFooterProps> = ({
  address,
}) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { hideOpModal } = useModals();

  // ---------------------------------------------------------------------------
  // Next Hooks
  // ---------------------------------------------------------------------------

  const router = useRouter();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { configuration } = useQueryConfiguration({
    address: address,
  });

  // ---------------------------------------------------------------------------
  // Query State
  // ---------------------------------------------------------------------------

  const [userOperations] = useUserOperationsQueryState();
  const [selectedOpIndex] = useUserOperationsIndexQueryState();

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  const onDismiss = useCallback(() => {
    hideOpModal();
    router.back();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const { signUserOperation } = useUserOperationCreate({
    address: address,
    configuration: configuration,
    userOperation:
      userOperations && userOperations.length > 0
        ? userOperations[selectedOpIndex ?? 0]
        : {},
  });

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { isFormDisabled } = useFormRef();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <FooterButton
      isModal
      className="pt-0"
      customSuccessText="Execute Transaction"
      disabled={isFormDisabled}
      cancelClick={onDismiss}
      successClick={signUserOperation}
    />
  );
};
