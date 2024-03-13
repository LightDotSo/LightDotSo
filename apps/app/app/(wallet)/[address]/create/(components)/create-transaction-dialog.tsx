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

import { useUserOperationsQueryState } from "@lightdotso/nuqs";
import { useQueryConfiguration, useQueryWallet } from "@lightdotso/query";
import type { UserOperation } from "@lightdotso/schemas";
import { useDev } from "@lightdotso/stores";
import { Transaction } from "@lightdotso/templates";
import { useEffect } from "react";
import type { FC } from "react";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type CreateTransactionDialogProps = {
  address: Address;
  userOperations: Omit<
    UserOperation,
    | "hash"
    | "signature"
    | "maxFeePerGas"
    | "maxPriorityFeePerGas"
    | "callGasLimit"
    | "preVerificationGas"
    | "verificationGasLimit"
  >[];
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const CreateTransactionDialog: FC<CreateTransactionDialogProps> = ({
  address,
  userOperations,
}) => {
  // ---------------------------------------------------------------------------
  // Query State Hooks
  // ---------------------------------------------------------------------------

  const [, setUserOperations] = useUserOperationsQueryState(userOperations);

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { isDev } = useDev();

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!userOperations) {
      return;
    }

    setUserOperations(userOperations);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { configuration: genesisConfiguration } = useQueryConfiguration({
    address: address,
    checkpoint: 0,
  });

  const { wallet } = useQueryWallet({
    address: address,
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!genesisConfiguration || !wallet) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-col items-center justify-center">
      <Transaction
        address={address}
        wallet={wallet}
        genesisConfiguration={genesisConfiguration}
        initialUserOperations={userOperations}
        isDev={isDev}
      />
    </div>
  );
};
