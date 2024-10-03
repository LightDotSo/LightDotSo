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

import { getGasSpeedBumpAmount } from "@lightdotso/utils";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------

type GasSpeed = {
  gasSpeed: "low" | "medium" | "high" | "instant";
  setGasSpeed: (gasSpeed: "low" | "medium" | "high" | "instant") => void;
  gasSpeedBumpAmount: number;
  setGasSpeedBumpAmount: (
    gasSpeed: "low" | "medium" | "high" | "instant",
  ) => void;
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useGasSpeed = create(
  devtools<GasSpeed>(
    (set) => ({
      gasSpeed: "high",
      gasSpeedBumpAmount: getGasSpeedBumpAmount("high"),
      setGasSpeed: (gasSpeed) => set(() => ({ gasSpeed: gasSpeed })),
      setGasSpeedBumpAmount: (gasSpeed) =>
        set(() => ({
          gasSpeedBumpAmount: getGasSpeedBumpAmount(gasSpeed),
        })),
    }),
    {
      anonymousActionType: "useGasSpeed",
      name: "GasSpeedStore",
      serialize: { options: true },
    },
  ),
);
