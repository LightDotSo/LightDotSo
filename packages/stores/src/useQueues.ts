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

import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------

type QueuesStore = {
  tokenQueueTimestamp: number | null;
  portfolioQueueTimestamp: number | null;
  setTokenQueueTimestamp: (timestamp: number) => void;
  setPortfolioQueueTimestamp: (timestamp: number) => void;
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useQueues = create(
  devtools(
    persist<QueuesStore>(
      set => ({
        tokenQueueTimestamp: null,
        portfolioQueueTimestamp: null,
        setTokenQueueTimestamp: timestamp =>
          set(() => ({ tokenQueueTimestamp: timestamp })),
        setPortfolioQueueTimestamp: timestamp =>
          set(() => ({ portfolioQueueTimestamp: timestamp })),
      }),
      {
        name: "queues-state-v1",
        storage: createJSONStorage(() => sessionStorage),
        skipHydration: true,
        version: 0,
      },
    ),
    {
      anonymousActionType: "useQueues",
      name: "QueuesStore",
      serialize: { options: true },
    },
  ),
);
