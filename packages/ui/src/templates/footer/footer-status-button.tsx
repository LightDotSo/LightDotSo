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

import { INTERNAL_LINKS } from "@lightdotso/const";
import { MonitorCheck } from "lucide-react";
import type { FC } from "react";
import { Button } from "../../components/button";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const FooterStatusButton: FC = () => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex items-center">
      <Button asChild size="xs" variant="ghost">
        <a href={INTERNAL_LINKS["Status"]} target="_blank" rel="noreferrer">
          <MonitorCheck className="size-4 text-text-info" />
          <span className="ml-2 text-xs text-text-info-strong">
            All systems normal.
          </span>
        </a>
      </Button>
    </div>
  );
};
