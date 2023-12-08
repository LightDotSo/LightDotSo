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

import { Button } from "@lightdotso/ui";
import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import { useMotionValue, Reorder, useDragControls } from "framer-motion";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useRaisedShadow } from "@/app/(wallet)/[address]/overview/(hooks)/useRaisedShadow";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface OverviewCardProps {
  href: string;
  value: string;
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
  value,
}: OverviewCardProps) => {
  const y = useMotionValue(0);
  const boxShadow = useRaisedShadow(y);
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      className="space-y-3 rounded-md border border-border bg-background p-4"
      value={value}
      id={value}
      style={{ boxShadow, y }}
      dragListener={false}
      dragControls={dragControls}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center">
          <DragHandleDots2Icon
            className="h-5 w-5 cursor-move text-text-icon-weaker"
            onPointerDown={event => dragControls.start(event)}
          />
          <div className="ml-2 text-lg font-semibold text-text-primary">
            {title}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {nav}
          <Button asChild size="sm" variant="outline">
            <Link href={href}>
              See All
              <ChevronRightIcon className="ml-2 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>
      {children}
    </Reorder.Item>
  );
};
