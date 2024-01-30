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
import type { ReactNode } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface TableSectionWrapperProps {
  children: ReactNode;
  className?: string;
}

// -----------------------------------------------------------------------------
// Layout
// -----------------------------------------------------------------------------

export function TableSectionWrapper({
  children,
  className,
}: TableSectionWrapperProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-background p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
