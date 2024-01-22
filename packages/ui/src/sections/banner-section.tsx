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

import type { FC, ReactNode } from "react";
import {
  MiddleLayerWrapper,
  type MiddleLayerWrapperProps,
} from "../wrappers/layer";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface BannerSectionProps extends MiddleLayerWrapperProps {
  title: string;
  description?: string;
  cta?: ReactNode;
  children: ReactNode;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const BannerSection: FC<BannerSectionProps> = ({
  title,
  description,
  cta,
  children,
  size,
}) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      <MiddleLayerWrapper size={size}>
        <div className="py-4 sm:py-6 md:py-8 lg:flex lg:items-center lg:justify-between">
          <div className="flex flex-col justify-between gap-2">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              {title}
            </h2>
            <p className="leading-8 text-text-weak">{description}</p>
          </div>
          {cta && (
            <div className="mt-4 flex items-center gap-x-6 lg:mt-0 lg:shrink-0">
              {cta}
            </div>
          )}
        </div>
      </MiddleLayerWrapper>
      {children}
    </>
  );
};
