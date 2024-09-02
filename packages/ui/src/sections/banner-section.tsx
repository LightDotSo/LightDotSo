// Copyright 2023-2024 LightDotSo.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
            <div className="font-bold text-2xl tracking-tight sm:text-3xl lg:text-4xl">
              {title}
            </div>
            <p className="text-text-weak leading-8">{description}</p>
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
