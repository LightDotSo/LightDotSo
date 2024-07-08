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
        <SelectValue
          className="inline-flex items-center"
          placeholder="Select a theme"
        />
      </SelectTrigger>
      <SelectContent>
        {themes.map(item => (
          <SelectItem key={item.name} value={item.value}>
            {/* NOTICE: A dirty hack to center the child `SelectPrimitive.ItemText` in parent `<span />` container */}
            <span className="mr-2 mt-0.5 inline-flex items-center">
              <item.icon
                className="mr-2 size-4 fill-text-weak"
                aria-hidden="true"
              />
              <span>{item.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
