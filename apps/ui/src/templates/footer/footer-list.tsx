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
  title: string;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const FooterListItem: FC<FooterListItemProps> = ({ items, title }) => {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-text-weaker">
        {title}
      </h3>
      <ul className="mt-4 space-y-4 ">
        {items.map(item => {
          return (
            <li
              key={item.name}
              className="text-text-weak hover:text-text hover:underline"
            >
              <a href={item.href} target="_blank" rel="noreferrer">
                {item.name}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const FooterList: FC = () => {
  return (
    <div className="mt-12 grid gap-8 xl:col-span-1 xl:mt-0">
      <div className="md:grid md:grid-cols-3 md:gap-8">
        <FooterListItem items={NAVIGATION_LINKS.resources} title="Resources" />
        <FooterListItem items={NAVIGATION_LINKS.company} title="Company" />
        <FooterListItem items={NAVIGATION_LINKS.legal} title="Legal" />
      </div>
    </div>
  );
};
