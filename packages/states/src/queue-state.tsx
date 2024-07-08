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

import {
  useMutationQueuePortfolio,
  useMutationQueueToken,
} from "@lightdotso/query";
import { useAuth, useQueues } from "@lightdotso/stores";
import type { FC } from "react";
import { useEffect } from "react";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const QueueState: FC = () => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { wallet } = useAuth();
  const {
    tokenQueueTimestamp,
    portfolioQueueTimestamp,
    setTokenQueueTimestamp,
    setPortfolioQueueTimestamp,
  } = useQueues();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { queueToken } = useMutationQueueToken({
    address: wallet as Address,
    isMinimal: true,
  });

  const { queuePortfolio } = useMutationQueuePortfolio({
    address: wallet as Address,
    isMinimal: true,
  });

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!useQueues.persist.hasHydrated()) {
      useQueues.persist.rehydrate();
    }
  }, []);

  useEffect(() => {
    // Wait for persisted state to load
    if (!wallet || !useQueues.persist.hasHydrated()) {
      return;
    }

    const now = Date.now();
    const THREE_MINUTES_IN_MILLISECONDS = 3 * 60 * 1000;

    if (
      now - (tokenQueueTimestamp[wallet] ?? 0) >
      THREE_MINUTES_IN_MILLISECONDS
    ) {
      queueToken();
      setTokenQueueTimestamp(wallet, now);
    } else if (
      now - (portfolioQueueTimestamp[wallet] ?? 0) >
      THREE_MINUTES_IN_MILLISECONDS
    ) {
      queuePortfolio();
      setPortfolioQueueTimestamp(wallet, now);
    }
  }, [
    tokenQueueTimestamp,
    portfolioQueueTimestamp,
    queueToken,
    queuePortfolio,
    setPortfolioQueueTimestamp,
    setTokenQueueTimestamp,
    wallet,
  ]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return null;
};
