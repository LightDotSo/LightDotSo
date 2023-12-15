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

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface SettingsPageWrapperProps {
  children: React.ReactNode;
  nav: React.ReactNode;
}

// -----------------------------------------------------------------------------
// Layout
// -----------------------------------------------------------------------------

export function SettingsPageWrapper({
  children,
  nav,
}: SettingsPageWrapperProps) {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="mt-8 flex flex-col space-y-8 lg:mt-12 lg:flex-row lg:space-x-32 lg:space-y-0">
      <aside className="lg:w-1/5">{nav}</aside>
      <div className="flex-1 lg:max-w-3xl">{children}</div>
    </div>
  );
}
