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

import { InternalLinks } from "./InternalLinks";
import { NotionLinks } from "./NotionLinks";
import { SocialLinks } from "./SocialLinks";

export const NavigationLinks = {
  resources: [
    { name: "Changelog", href: InternalLinks.Changelog, external: false },
    { name: "Docs", href: InternalLinks.Docs, external: false },
    { name: "FAQ", href: NotionLinks.Faq, external: true },
    { name: "Membership", href: InternalLinks.Membership, external: false },
    { name: "Support", href: SocialLinks.Discord, external: true },
  ],
  company: [
    { name: "Careers", href: NotionLinks.Careers, external: true },
    { name: "Home", href: InternalLinks.Home, external: false },
    { name: "Open", href: SocialLinks.Plausible, external: false },
    { name: "Notion", href: SocialLinks.Notion, external: true },
  ],
  legal: [
    {
      name: "Privacy Policy",
      href: NotionLinks["Privacy Policy"],
      external: true,
    },
    {
      name: "Terms of Service",
      href: NotionLinks["Terms of Service"],
      external: true,
    },
  ],
};
