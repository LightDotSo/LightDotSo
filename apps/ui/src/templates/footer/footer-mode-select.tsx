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

import { useTheme } from "next-themes";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const FooterModeSelect: FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <select
        id="mode"
        name="mode"
        className="mt-1 w-full cursor-pointer rounded-md border-border bg-inherit py-2 pl-3 pr-10 text-base text-text-weak sm:block sm:text-sm"
        value={theme}
        onBlur={() => {}}
        onChange={e => {
          return setTheme(e.target.value);
        }}
      >
        <option value="dark">Dark</option>
        <option value="light">Light</option>
        <option value="system">System</option>
      </select>
    </div>
  );
};
