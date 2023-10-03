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

/* eslint-disable no-unused-vars */
export enum Social {
  DISCORD = "Discord",
  OPENSEA = "Opensea",
  GITHUB = "Github",
  MIRROR = "Mirror",
  NOTION = "Notion",
  PLAUSIBLE = "Plausible",
  TWITTER = "Twitter",
  WEBSITE = "Website",
}

export const SocialLinks: {
  readonly [key in Social]: string;
} = {
  [Social.DISCORD]: "https://discord.gg/Vgfxg2Rcy8",
  [Social.GITHUB]: "https://github.com/LightDotSo",
  [Social.MIRROR]: "https://mirror.xyz/lightdotso.eth",
  [Social.NOTION]: "https://lightdotso.notion.site",
  [Social.OPENSEA]: "https://opensea.io",
  [Social.PLAUSIBLE]: "https://plausible.io/light.so",
  [Social.TWITTER]: "https://twitter.com/LightDotSo",
  [Social.WEBSITE]: "https://light.so",
};
