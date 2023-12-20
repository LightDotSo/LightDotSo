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

// From: https://github.com/themesberg/flowbite-react/blob/f186ec8437003772966f5608a1c87a6f1f49ab8b/src/components/Timeline/Timeline.stories.tsx
// License: MIT

import type { Meta, StoryObj } from "@storybook/react";
import { Wallet } from "lucide-react";
import {
  Timeline,
  TimelineContent,
  TimelineItem,
  TimelinePoint,
  TimelineTitle,
  TimelineBody,
  TimelineTime,
} from "./timeline";

const meta: Meta<typeof Timeline> = {
  title: "ui/Timeline",
  component: Timeline,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

type Story = StoryObj<typeof Timeline>;

export const Base: Story = {
  render: args => (
    <Timeline>
      <TimelineItem>
        <TimelinePoint>Hi</TimelinePoint>
        <TimelineContent>
          <TimelineTime>February 2022</TimelineTime>
          <TimelineTitle>Application UI code in Tailwind CSS</TimelineTitle>
          <TimelineBody>
            Get access to over 20+ pages including a dashboard layout, charts,
            kanban board, calendar, and pre-order E-commerce & Marketing pages.
          </TimelineBody>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelinePoint>Hi</TimelinePoint>
        <TimelineContent>
          <TimelineTime>March 2022</TimelineTime>
          <TimelineTitle>Marketing UI design in Figma</TimelineTitle>
          <TimelineBody>
            All of the pages and components are first designed in Figma and we
            keep a parity between the two versions even as we update the
            project.
          </TimelineBody>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelinePoint>L</TimelinePoint>
        <TimelineContent>
          <TimelineTitle>E-Commerce UI code in Tailwind CSS</TimelineTitle>
          <TimelineBody>
            Get started with dozens of web components and interactive elements
            built on top of Tailwind CSS.
          </TimelineBody>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelinePoint>
          <span className="inline-flex p-1">
            <Wallet className="h-3 w-3 text-text" />
          </span>
        </TimelinePoint>
        <TimelineContent>
          <TimelineTime>December 2023</TimelineTime>
          <TimelineTitle>Everything else is secondary</TimelineTitle>
          <TimelineBody>
            Have the courage to follow your heart and intuition. They somehow
            know what you truly want to become.
          </TimelineBody>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  ),
  args: {},
};
