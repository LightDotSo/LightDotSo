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

import { cn } from "@lightdotso/utils";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface BaseLayerWrapperProps {
  children: React.ReactNode;
  className?: string;
}

// -----------------------------------------------------------------------------
// Layout
// -----------------------------------------------------------------------------

export function BaseLayerWrapper({
  children,
  className,
}: BaseLayerWrapperProps) {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      className={cn(
        "flex w-full overflow-x-scroll flex-row px-2 md:px-4 lg:px-8 md:overflow-hidden",
        className,
      )}
    >
      <div className="mx-auto max-w-7xl flex-1">{children}</div>
    </div>
  );
}
