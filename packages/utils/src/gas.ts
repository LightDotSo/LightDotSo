import { GAS_SPEED_BUMP } from "@lightdotso/const";
import type { GasSpeed } from "@lightdotso/types";

export function getGasSpeedBumpAmount(gasSpeed: GasSpeed): number {
  switch (gasSpeed) {
    case "low":
      return GAS_SPEED_BUMP.Low;
    case "medium":
      return GAS_SPEED_BUMP.Medium;
    case "high":
      return GAS_SPEED_BUMP.High;
    case "instant":
      return GAS_SPEED_BUMP.Instant;
    default:
      return GAS_SPEED_BUMP.Medium;
  }
}
