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

/* eslint-disable no-unused-vars */
export enum Social {
  CAL = "Cal",
  DISCORD = "Discord",
  GITHUB = "Github",
  MIRROR = "Mirror",
  NOTION = "Notion",
  TELEGRAM = "Telegram",
  TWITTER = "Twitter",
  WEBSITE = "Website",
}

export const SOCIAL_LINKS: {
  readonly [key in Social]: string;
} = {
  [Social.CAL]: "https://cal.com/lightdotso/support",
  [Social.DISCORD]: "https://discord.gg/LightDotSo",
  [Social.GITHUB]: "https://github.com/LightDotSo/LightDotSo",
  [Social.MIRROR]: "https://mirror.xyz/lightdotso.eth",
  [Social.NOTION]: "https://lightdotso.notion.site",
  [Social.TELEGRAM]: "https://t.me/LightDotSo",
  [Social.TWITTER]: "https://twitter.com/LightDotSo",
  [Social.WEBSITE]: "https://light.so",
};
