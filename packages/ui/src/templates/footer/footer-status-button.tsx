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

import { MonitorCheck } from "lucide-react";
import type { FC } from "react";
import { Button } from "../../components/ui/button";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const FooterStatusButton: FC = () => {
  return (
    <div className="flex items-center">
      <Button asChild size="xs" variant="ghost">
        <a href="https://status.light.so" target="_blank" rel="noreferrer">
          <MonitorCheck className="h-4 w-4 text-text-info" />
          <span className="ml-2 text-xs text-text-info-strong">
            All systems normal.
          </span>
        </a>
      </Button>
    </div>
  );
};
