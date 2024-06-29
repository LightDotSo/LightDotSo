// Copyright 2023-2024 Light
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

import type { UserOperationData } from "@lightdotso/data";
import {
  Avatar,
  TimeAgo,
  Timeline,
  TimelineBody,
  TimelineContent,
  TimelineItem,
  TimelinePoint,
  TimelineTitle,
} from "@lightdotso/ui";
import { Check, Hourglass, PenLineIcon } from "lucide-react";
import type { FC, ReactNode } from "react";
import type { Address } from "viem";
import { PlaceholderOrb } from "./placeholder-orb";

// -----------------------------------------------------------------------------
// Wrapper
// -----------------------------------------------------------------------------

interface AddressPinPointerProps {
  address: Address;
  children: ReactNode;
}

export const AddressPinPointer: FC<AddressPinPointerProps> = ({
  address,
  children,
}) => (
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  <span className="relative inline-block">
    <span className="relative">
      <Avatar className="size-6">
        <PlaceholderOrb address={address} />
      </Avatar>
    </span>
    <span className="absolute left-3 top-2 size-3">{children}</span>
  </span>
);

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type UserOperationTimelineProps = {
  userOperation: UserOperationData;
  size?: "xs" | "sm";
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const UserOperationTimeline: FC<UserOperationTimelineProps> = ({
  userOperation: { created_at, signatures },
  size = "sm",
}) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Timeline>
      <TimelineItem>
        <TimelinePoint size={size}>
          <AddressPinPointer
            address={"0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed"}
          >
            <span className="inline-flex rounded-full border border-border-success bg-background-success p-1">
              <Check className="size-2 text-text-inverse" />
            </span>
          </AddressPinPointer>
        </TimelinePoint>
        <TimelineContent>
          <TimelineTitle size={size}>Created</TimelineTitle>
          <TimelineBody size={size}>
            <TimeAgo value={new Date(created_at)} />
          </TimelineBody>
        </TimelineContent>
      </TimelineItem>
      {signatures.map(({ created_at, owner_id }) => (
        <TimelineItem key={owner_id}>
          <TimelinePoint size={size}>
            <AddressPinPointer
              address={"0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed"}
            >
              <span className="inline-flex rounded-full border border-border-info bg-background-info p-1">
                <PenLineIcon className="size-2 text-text-inverse" />
              </span>
            </AddressPinPointer>
          </TimelinePoint>
          <TimelineContent>
            <TimelineTitle size={size}>Signed</TimelineTitle>
            <TimelineBody size={size}>
              <TimeAgo value={new Date(created_at)} />
            </TimelineBody>
          </TimelineContent>
        </TimelineItem>
      ))}
      <TimelineItem>
        <TimelinePoint size={size}>
          <span className="relative inline-block">
            <span className="inline-flex size-6 items-center justify-center rounded-full border border-border-warning-weak bg-background-warning p-1">
              <Hourglass className="size-2.5 text-text-inverse" />
            </span>
          </span>
        </TimelinePoint>
        <TimelineContent>
          <TimelineTitle size={size}>Waiting for Execution</TimelineTitle>
          <TimelineBody size={size}>
            Can be executed once threshold is reached.
          </TimelineBody>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  );
};
