// Copyright 2023-2024 Light, Inc.
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

import { Button } from "@lightdotso/ui";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface OverviewCardProps {
  href: string;
  title: string;
  children: ReactNode;
  nav: ReactNode;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const OverviewCard = ({
  href,
  children,
  nav,
  title,
}: OverviewCardProps) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-3 rounded-md border border-border bg-background p-4">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center">
          <div className="ml-2 text-lg font-semibold text-text-primary">
            {title}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {nav}
          <Button asChild size="sm" variant="outline">
            <Link href={href}>
              See All
              <ChevronRightIcon className="ml-2 size-3" />
            </Link>
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
};
