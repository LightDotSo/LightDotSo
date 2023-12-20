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
    <ol className={cn("relative border-l border-border", className)} {...props}>
      {children}
    </ol>
  );
};

interface TimelnePointProps extends ComponentProps<"div"> {}
const TimelinePoint: FC<TimelnePointProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={className} {...props}>
      {children ? (
        <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-background ring-2 ring-light">
          {children}
        </span>
      ) : (
        <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-border-weak bg-background-primary" />
      )}
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
    <div className={className} {...props}>
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
    <li className={cn("mb-10 ml-6", className)} {...props}>
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
    <h1 className={cn("text-lg font-semibold text-text", className)} {...props}>
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
      className={cn("mb-4 text-base font-normal text-text-weak", className)}
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
      className={cn(
        "mb-1 text-sm font-normal leading-none text-text",
        className,
      )}
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
