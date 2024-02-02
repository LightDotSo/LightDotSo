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

import { GITHUB_LINKS } from "@lightdotso/const";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const FooterCopy: FC = () => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <p className="text-xs text-text-weak/60 xl:text-center">
      &copy; {new Date().getFullYear()}
      <span className="hidden md:inline-flex">&nbsp;Light, Inc. - </span>{" "}
      <a
        className="hidden text-text-weak hover:underline md:inline-flex"
        href={GITHUB_LINKS["Repo"]}
        target="_blank"
        rel="noreferrer"
      >
        AGPL v3.0
      </a>
    </p>
  );
};
