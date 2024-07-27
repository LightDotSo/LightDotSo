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

// From: https://github.com/themesberg/flowbite-react/blob/f186ec8437003772966f5608a1c87a6f1f49ab8b/src/components/Timeline/Timeline.stories.tsx
// License: MIT

import type { Meta, StoryObj } from "@storybook/react";
import { Wallet } from "lucide-react";
import {
  Timeline,
  TimelineBody,
  TimelineContent,
  TimelineItem,
  TimelinePoint,
  TimelineTime,
  TimelineTitle,
} from "./timeline";

// -----------------------------------------------------------------------------
// Meta
// -----------------------------------------------------------------------------

const meta: Meta<typeof Timeline> = {
  title: "component/Timeline",
  component: Timeline,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Story = StoryObj<typeof Timeline>;

// -----------------------------------------------------------------------------
// Story
// -----------------------------------------------------------------------------

export const Base: Story = {
  render: (_args) => (
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
            <Wallet className="size-3 text-text" />
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
