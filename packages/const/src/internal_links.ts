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

export enum Internal {
  CHANGELOG = "Changelog",
  DOCS = "Docs",
  EXPLORER = "Explorer",
  OPEN = "Open",
  HOME = "Home",
  STATUS = "Status",
}

export const INTERNAL_LINKS: {
  readonly [key in Internal]: string;
} = {
  [Internal.CHANGELOG]: "https://changelog.light.so",
  [Internal.DOCS]: "https://docs.light.so",
  [Internal.EXPLORER]: "https://explorer.light.so",
  [Internal.OPEN]: "https://open.light.so",
  [Internal.HOME]: "https://light.so/home",
  [Internal.STATUS]: "https://lightdotso.instatus.com",
};
