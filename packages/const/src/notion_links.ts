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

export const NOTION_LINKS: {
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
