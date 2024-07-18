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

import { TokenAmount } from "@lightdotso/types";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------

type TokenGroupsStore = {
  tokenGroups: { [key: string]: TokenAmount[] };
  setTokenGroupByGroupId: (groupId: string, tokenAmount: TokenAmount) => void;
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useTokenGroups = create(
  devtools(
    persist<TokenGroupsStore>(
      set => ({
        tokenGroups: {},
        setTokenGroupByGroupId: (groupId, tokenAmount) =>
          // Add tokenAmount to tokenGroups for groupId and chainId
          // The chainId has to be unique for each group
          set(state => {
            // Get tokenAmounts for groupId
            const groupTokenAmounts = state.tokenGroups[groupId] ?? [];

            // Check if tokenAmount is already in tokenAmounts
            const index = groupTokenAmounts.findIndex(
              groupTokenAmount =>
                groupTokenAmount.chain_id === tokenAmount.chain_id,
            );

            // If tokenAmount is in tokenAmounts, update it
            if (index !== -1) {
              groupTokenAmounts[index] = tokenAmount;
            } else {
              // If tokenAmount is not in tokenAmounts, add it
              groupTokenAmounts.push(tokenAmount);
            }

            // Order tokenAmounts by amount
            groupTokenAmounts.sort((a, b) =>
              a.amount.toString() > b.amount.toString() ? 1 : -1,
            );

            // Update tokenGroups with new groupTokenAmounts
            return {
              tokenGroups: {
                ...state.tokenGroups,
                [groupId]: groupTokenAmounts,
              },
            };
          }),
      }),
      {
        name: "token-groups-state-v1",
        storage: createJSONStorage(() => sessionStorage, {
          reviver: (_key: string, value: any): any => {
            // Ignore functions during serialization
            if (typeof value === "function") {
              return undefined;
            }
            if (value && typeof value === "object" && value.type === "bigint") {
              return BigInt(value.value);
            }
            return value;
          },
          replacer: (_key: string, value: any): any => {
            if (typeof value === "bigint") {
              return { type: "bigint", value: value.toString() };
            }
            return value;
          },
        }),
        skipHydration: true,
        version: 0,
      },
    ),
    {
      anonymousActionType: "useTokenGroups",
      name: "TokenGroupsStore",
      serialize: {
        replacer: (_key: any, value: any) =>
          typeof value === "bigint" ? value.toString() : value,
      },
    },
  ),
);
