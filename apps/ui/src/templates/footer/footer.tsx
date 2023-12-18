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
import { FooterModeSelect } from "./footer-mode-select";
import { FooterSocial } from "./footer-social";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Footer: FC = () => {
  return (
    <footer className="border-t border-border" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-2 xl:gap-8">
          <FooterSocial />
          <FooterList />
        </div>
        <div className="mt-12 space-y-6 border-t border-border pt-8 md:flex md:items-center md:justify-between">
          <p className="text-base text-text-weak xl:text-center">
            &copy; {new Date().getFullYear()} Light, Inc. All rights reserved.
          </p>
          <FooterModeSelect />
        </div>
      </div>
    </footer>
  );
};
