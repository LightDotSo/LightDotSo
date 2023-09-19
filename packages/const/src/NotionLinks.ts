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

export enum NotionPages {
  CAREERS = "Careers",
  COMMUNITY = "Community",
  FAQ = "Faq",
  PRIVACY_POLICY = "Privacy Policy",
  TERMS_OF_SERVICE = "Terms of Service",
  MARKETING = "Marketing",
  ROADMAP = "Roadmap",
  STATS = "Stats",
  TEAM = "Team",
}

export const NotionLinks: {
  readonly [key in NotionPages]: string;
} = {
  [NotionPages.CAREERS]:
    "https://lightdotso.notion.site/3241632ef8d54d21a73732cbad792ce4",
  [NotionPages.COMMUNITY]:
    "https://lightdotso.notion.site/a797b4dd6772427f9039530f8237af52",
  [NotionPages.FAQ]:
    "https://lightdotso.notion.site/d9a70e761b9e4290bc2b8e58cd71a70c",
  [NotionPages.PRIVACY_POLICY]:
    "https://lightdotso.notion.site/81dbf21d7bca4b9285a13392edbf575e",
  [NotionPages.TERMS_OF_SERVICE]:
    "https://lightdotso.notion.site/38d646143772410887a0e6cae3ee0e56",
  [NotionPages.MARKETING]:
    "https://lightdotso.notion.site/7376e95f478740609a7892a6655b9654",
  [NotionPages.ROADMAP]:
    "https://lightdotso.notion.site/21b4c7b11a6747dd88a89eb7a1177837",
  [NotionPages.STATS]:
    "https://lightdotso.notion.site/58f5993e078147caaddb41d7890711e7",
  [NotionPages.TEAM]:
    "https://lightdotso.notion.site/a01c7d1d1eb94ce697595e53d6e8568b",
};
