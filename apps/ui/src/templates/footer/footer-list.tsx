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

import { NAVIGATION_LINKS } from "@lightdotso/const";
import { ArrowUpRight } from "lucide-react";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface ListItem {
  name: string;
  href: string;
}

interface FooterListItemProps {
  items: ListItem[];
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const FooterListItem: FC<FooterListItemProps> = ({ items }) => {
  return (
    <>
      {items.map(item => {
        return (
          <li
            key={item.name}
            className="text-sm text-text-weak/60 hover:underline"
          >
            <a href={item.href} target="_blank" rel="noreferrer">
              {item.name}
            </a>
          </li>
        );
      })}
    </>
  );
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const FooterList: FC = () => {
  return (
    <ul className="grid grid-cols-2 gap-3 md:flex md:flex-row md:justify-between">
      <FooterListItem items={NAVIGATION_LINKS.resources} />
      <FooterListItem items={NAVIGATION_LINKS.company} />
      <FooterListItem items={NAVIGATION_LINKS.legal} />
    </ul>
  );
};
