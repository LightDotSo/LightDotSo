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
import { FooterList } from "./footer-list";
import { FooterLogo } from "./footer-logo";
import { FooterSocial } from "./footer-social";
import { FooterVersion } from "./footer-version";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Footer: FC = () => {
  return (
    <footer
      className="border-t border-border px-2 md:px-4 lg:px-8"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl py-8 space-y-4 md:space-y-8">
        <div className="flex flex-col space-y-6 md:space-y-0 md:flex-row justify-between md:items-center">
          <FooterLogo />
          <FooterSocial />
        </div>
        <div>
          <FooterList />
        </div>
        <div className="hidden md:flex justify-end">
          <FooterVersion />
        </div>
      </div>
    </footer>
  );
};
