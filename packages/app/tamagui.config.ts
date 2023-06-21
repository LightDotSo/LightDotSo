import { config } from "ui";

export type Conf = typeof config;

declare module "tamagui" {
  interface TamaguiCustomConfig extends Conf {}
}

export default config;
