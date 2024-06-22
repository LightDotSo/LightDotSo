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

import { INTERNAL_LINKS } from "./internal_links";
import { NOTION_LINKS } from "./notion_links";
import { SOCIAL_LINKS } from "./social_links";

export const NAVIGATION_LINKS = {
  resources: [
    { name: "Changelog", href: INTERNAL_LINKS.Changelog },
    { name: "Docs", href: INTERNAL_LINKS.Docs },
    { name: "Paper", href: INTERNAL_LINKS.Paper },
    { name: "Explorer", href: INTERNAL_LINKS.Explorer },
    { name: "FAQ", href: NOTION_LINKS.Faq },
    { name: "Governance", href: INTERNAL_LINKS.Governance },
    { name: "Proposals", href: INTERNAL_LINKS.Proposals },
    { name: "Support", href: SOCIAL_LINKS.Discord },
  ],
  company: [
    { name: "Careers", href: NOTION_LINKS.Careers },
    { name: "Home", href: INTERNAL_LINKS.Home },
    { name: "Open", href: INTERNAL_LINKS.Open },
    { name: "Notion", href: SOCIAL_LINKS.Notion },
    { name: "Status", href: INTERNAL_LINKS.Status },
  ],
  legal: [
    {
      name: "Privacy Policy",
      href: NOTION_LINKS["Privacy Policy"],
      external: true,
    },
    {
      name: "Terms of Service",
      href: NOTION_LINKS["Terms of Service"],
      external: true,
    },
  ],
};
