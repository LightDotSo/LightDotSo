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

// From: https://github.com/themesberg/flowbite-react/blob/f186ec8437003772966f5608a1c87a6f1f49ab8b/src/components/Timeline/Timeline.tsx
// From: https://github.com/themesberg/flowbite-react/blob/f186ec8437003772966f5608a1c87a6f1f49ab8b/src/components/Timeline/TimelineBody.tsx
// From: https://github.com/themesberg/flowbite-react/blob/f186ec8437003772966f5608a1c87a6f1f49ab8b/src/components/Timeline/TimelineContent.tsx
// From: https://github.com/themesberg/flowbite-react/blob/f186ec8437003772966f5608a1c87a6f1f49ab8b/src/components/Timeline/TimelineItem.tsx
// From: https://github.com/themesberg/flowbite-react/blob/f186ec8437003772966f5608a1c87a6f1f49ab8b/src/components/Timeline/TimelinePoint.tsx
// From: https://github.com/themesberg/flowbite-react/blob/f186ec8437003772966f5608a1c87a6f1f49ab8b/src/components/Timeline/TimelineTime.tsx
// From: https://github.com/themesberg/flowbite-react/blob/f186ec8437003772966f5608a1c87a6f1f49ab8b/src/components/Timeline/TimelineTitle.tsx
// License: MIT

import { cn } from "@lightdotso/utils";
import type { ComponentProps, FC } from "react";

interface TimelineProps extends ComponentProps<"ol"> {}
const Timeline: FC<TimelineProps> = ({ children, className, ...props }) => {
  return (
    <ol className={cn("relative", className)} {...props}>
      {children}
    </ol>
  );
};

interface TimelnePointProps extends ComponentProps<"div"> {
  children: React.ReactNode;
}
const TimelinePoint: FC<TimelnePointProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={className} {...props}>
      <span className="absolute -left-3 z-20 flex h-6 w-6 items-center justify-center rounded-full">
        {children}
      </span>
    </div>
  );
};

interface TimelineContentProps extends ComponentProps<"div"> {}
const TimelineContent: FC<TimelineContentProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn("pb-4", className)} {...props}>
      {children}
    </div>
  );
};

interface TimelineItemProps extends ComponentProps<"li"> {}
const TimelineItem: FC<TimelineItemProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <li
      className={cn(
        "pl-6 border-l border-border-strong last:border-0",
        className,
      )}
      {...props}
    >
      {/* <div className="absolute left-0 top-0 z-10 h-2 w-1 bg-background" /> */}
      {children}
    </li>
  );
};

interface TimelineTitleProps extends ComponentProps<"h1"> {}
const TimelineTitle: FC<TimelineTitleProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <h1
      className={cn("text-base font-semibold text-text", className)}
      {...props}
    >
      {children}
    </h1>
  );
};

interface TimelineBodyProps extends ComponentProps<"p"> {}
const TimelineBody: FC<TimelineBodyProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn("text-base font-normal text-text-weak", className)}
      {...props}
    >
      {children}
    </div>
  );
};

interface TimelineTimeProps extends ComponentProps<"time"> {}
const TimelineTime: FC<TimelineTimeProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <time
      className={cn("text-sm font-normal leading-none text-text", className)}
      {...props}
    >
      {children}
    </time>
  );
};

export {
  Timeline,
  TimelineContent,
  TimelineItem,
  TimelinePoint,
  TimelineTitle,
  TimelineBody,
  TimelineTime,
};
