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

import { LightHorizontalLogo } from "@lightdotso/svg";
import type { FC } from "react";
import { FooterCopy } from "./footer-copy";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const FooterLogo: FC = () => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex shrink-0 items-center space-x-1">
      <LightHorizontalLogo className="block h-8" />
      <span className="md:hidden">
        <FooterCopy />
      </span>
    </div>
  );
};
