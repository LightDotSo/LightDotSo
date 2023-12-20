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
import type { ComponentProps, FC, ReactNode } from "react";

export interface TimelineProps extends ComponentProps<"ol"> {}
export const Timeline: FC<TimelineProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <ol
      data-testid="timeline-component"
      className={cn("relative border-l border-border", className)}
      {...props}
    >
      {children}
    </ol>
  );
};

export interface TimelnePointProps extends ComponentProps<"div"> {
  icon?: ReactNode;
}
export const TimelinePoint: FC<TimelnePointProps> = ({
  children,
  className,
  icon,
  ...props
}) => {
  return (
    <div data-testid="timeline-point" className={className} {...props}>
      {children}
      {icon ? (
        <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-light">
          {icon}
        </span>
      ) : (
        <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-border-weak bg-background-primary" />
      )}
    </div>
  );
};

export interface TimelineContentProps extends ComponentProps<"div"> {}
export const TimelineContent: FC<TimelineContentProps> = ({
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

export interface TimelineItemProps extends ComponentProps<"li"> {}
export const TimelineItem: FC<TimelineItemProps> = ({
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

export interface TimelineTitleProps extends ComponentProps<"h1"> {}
export const TimelineTitle: FC<TimelineTitleProps> = ({
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

export interface TimelineBodyProps extends ComponentProps<"p"> {}
export const TimelineBody: FC<TimelineBodyProps> = ({
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

export interface TimelineTimeProps extends ComponentProps<"time"> {}
export const TimelineTime: FC<TimelineTimeProps> = ({
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
