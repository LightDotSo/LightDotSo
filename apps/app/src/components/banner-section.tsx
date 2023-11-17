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
import { Separator } from "@lightdotso/ui";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface BannerSectionProps {
  title: string;
  description?: string;
  cta?: React.ReactNode;
  children: React.ReactNode;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const BannerSection: FC<BannerSectionProps> = ({
  title,
  description,
  cta,
  children,
}) => {
  return (
    <>
      <div className="flex-1">
        <div className="mx-auto max-w-7xl flex-1 px-4 py-8 sm:py-12 lg:flex lg:items-center lg:justify-between lg:px-8">
          <div className="flex flex-col justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              {title}
            </h2>
            <p className="leading-8 text-muted-foreground">{description}</p>
          </div>
          <div className="mt-4 flex items-center gap-x-6 lg:mt-0 lg:shrink-0">
            {cta}
          </div>
        </div>
        <Separator className="my-0" />
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <div className="mx-auto max-w-7xl flex-1 px-2 md:px-4 lg:px-0">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};
