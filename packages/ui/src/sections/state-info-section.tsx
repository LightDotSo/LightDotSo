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

"use client";

import { cn } from "@lightdotso/utils";
import type { HTMLAttributes, ReactNode } from "react";
import { Skeleton } from "../components/skeleton";
import { baseHeightWrapper } from "../wrappers/base";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type StateInfoSectionProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  icon: ReactNode;
  title: string;
  description: string;
};

// -----------------------------------------------------------------------------
// Components
// -----------------------------------------------------------------------------

function StateInfoSection({
  children,
  icon,
  className,
  title,
  description,
  ...props
}: StateInfoSectionProps) {
  return (
    <div className={cn("text-center", baseHeightWrapper, className)} {...props}>
      {icon}
      <h3 className="mt-2 font-semibold text-xl tracking-tight md:mt-4 md:text-2xl">
        {title}
      </h3>
      <p className="mt-1 text-sm text-text-weak md:text-base">{description}</p>
      <div className="mt-6 flex justify-center p-4">{children}</div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Skeleton
// -----------------------------------------------------------------------------

function StateInfoSectionSkeleton() {
  return (
    <div className={cn("text-center", baseHeightWrapper)}>
      <Skeleton className="mx-auto h-12 w-12 rounded-full" />
      <Skeleton className="mx-auto mt-2 h-6 w-48 md:mt-4" />
      <Skeleton className="mx-auto mt-1 h-4 w-64" />
      <div className="mt-6 flex justify-center p-4">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export { StateInfoSection, StateInfoSectionSkeleton };
