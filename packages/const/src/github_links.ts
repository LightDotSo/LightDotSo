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

export enum Github {
  ACKNOWLEDGEMENTS = "Acknowledgements",
  AUDIT = "Audit",
  LICENSE = "License",
}

export const GITHUB_LINKS: {
  readonly [key in Github]: string;
} = {
  [Github.ACKNOWLEDGEMENTS]:
    "https://github.com/LightDotSo/LightDotSo/blob/main/ACKNOWLEDGEMENTS.md",
  [Github.AUDIT]: "https://github.com/LightDotSo/LightDotSo/blob/main/audits",
  [Github.LICENSE]:
    "https://github.com/LightDotSo/LightDotSo/blob/main/LICENSE.md",
};
