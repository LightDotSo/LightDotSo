// Copyright 2023-2024 Light.
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
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const FooterListItem: FC<FooterListItemProps> = ({ items }) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

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
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <ul className="grid grid-cols-2 gap-3 gap-y-4 md:flex md:flex-row md:justify-between">
      <FooterListItem items={NAVIGATION_LINKS.resources} />
      <FooterListItem items={NAVIGATION_LINKS.company} />
      <FooterListItem items={NAVIGATION_LINKS.legal} />
    </ul>
  );
};
