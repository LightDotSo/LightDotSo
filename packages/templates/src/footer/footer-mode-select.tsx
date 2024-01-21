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

"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@lightdotso/ui";
import { useTheme } from "next-themes";
import type { FC, SVGProps } from "react";
import { FaMoon, FaSun, FaRegLightbulb } from "react-icons/fa";

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const themes = [
  {
    name: "Dark",
    value: "dark",
    icon: (props: SVGProps<SVGSVGElement>) => {
      return <FaMoon className="text-contrast-medium" {...props} />;
    },
  },
  {
    name: "Light",
    value: "light",
    icon: (props: SVGProps<SVGSVGElement>) => {
      return <FaSun className="text-contrast-medium" {...props} />;
    },
  },
  {
    name: "System",
    value: "system",
    icon: (props: SVGProps<SVGSVGElement>) => {
      return <FaRegLightbulb className="text-contrast-medium" {...props} />;
    },
  },
];
// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const FooterModeSelect: FC = () => {
  // ---------------------------------------------------------------------------
  // Operation Hooks
  // ---------------------------------------------------------------------------

  const { theme, setTheme } = useTheme();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Select value={theme} defaultValue={theme} onValueChange={setTheme}>
      <SelectTrigger size="sm" className="w-auto bg-background-stronger">
        <SelectValue placeholder="Select a theme" />
      </SelectTrigger>
      <SelectContent>
        {themes.map(item => (
          <SelectItem key={item.name} value={item.value}>
            <span className="inline-flex items-center">
              <item.icon
                className="mr-2 size-4 fill-text-weak"
                aria-hidden="true"
              />
              <span className="mr-2">{item.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
