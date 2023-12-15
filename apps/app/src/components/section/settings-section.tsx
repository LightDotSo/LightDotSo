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

import type { FC } from "react";

// -----------------------------------------------------------------------------
// Type
// -----------------------------------------------------------------------------

interface SettingsSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const SettingsSection: FC<SettingsSectionProps> = ({
  title,
  description,
  children,
}) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-medium tracking-tight md:text-2xl">
          {title}
        </h3>
        <p className="md:text-md mt-4 text-sm leading-6 text-text-weak">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
};
