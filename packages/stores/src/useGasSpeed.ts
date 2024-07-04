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

import { create } from "zustand";
import { devtools } from "zustand/middleware";

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

// Get the gas speed bumpAmount in bigint from the gas speed
export const getGasSpeedBumpAmount = (
  gasSpeed: "low" | "medium" | "high" | "instant",
) => {
  switch (gasSpeed) {
    case "low":
      return BigInt(110);
    case "medium":
      return BigInt(115);
    case "high":
      return BigInt(120);
    case "instant":
      return BigInt(125);
  }
};

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------

type GasSpeed = {
  gasSpeed: "low" | "medium" | "high" | "instant";
  setGasSpeed: (gasSpeed: "low" | "medium" | "high" | "instant") => void;
  gasSpeedBumpAmount: bigint;
  setGasSpeedBumpAmount: (
    gasSpeed: "low" | "medium" | "high" | "instant",
  ) => void;
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useGasSpeed = create(
  devtools<GasSpeed>(
    set => ({
      gasSpeed: "medium",
      gasSpeedBumpAmount: getGasSpeedBumpAmount("medium"),
      setGasSpeed: gasSpeed => set(() => ({ gasSpeed: gasSpeed })),
      setGasSpeedBumpAmount: gasSpeed =>
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
