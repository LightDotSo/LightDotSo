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

import { INTERNAL_LINKS } from "./internal_links";
import { NOTION_LINKS } from "./notion_links";
import { SOCIAL_LINKS } from "./social_links";

export const NAVIGATION_LINKS = {
  resources: [
    { name: "Changelog", href: INTERNAL_LINKS.Changelog, external: false },
    { name: "Docs", href: INTERNAL_LINKS.Docs, external: false },
    { name: "FAQ", href: NOTION_LINKS.Faq, external: true },
    { name: "Membership", href: INTERNAL_LINKS.Membership, external: false },
    { name: "Support", href: SOCIAL_LINKS.Discord, external: true },
  ],
  company: [
    { name: "Careers", href: NOTION_LINKS.Careers, external: true },
    { name: "Home", href: INTERNAL_LINKS.Home, external: false },
    { name: "Open", href: SOCIAL_LINKS.Plausible, external: false },
    { name: "Notion", href: SOCIAL_LINKS.Notion, external: true },
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
