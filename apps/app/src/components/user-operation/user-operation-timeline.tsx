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

import {
  Avatar,
  Timeline,
  TimelineBody,
  TimelineContent,
  TimelineItem,
  TimelinePoint,
  TimelineTitle,
} from "@lightdotso/ui";
import { Check, Hourglass, PenLineIcon } from "lucide-react";
import type { FC, ReactNode } from "react";
import TimeAgo from "timeago-react";
import type { Address } from "viem";
import { PlaceholderOrb } from "@/components/lightdotso/placeholder-orb";
import type { UserOperationData } from "@/data";

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
  <span className="relative inline-block">
    <span className="relative">
      <Avatar className="h-6 w-6">
        <PlaceholderOrb address={address} />
      </Avatar>
    </span>
    <span className="absolute left-3 top-2 h-3 w-3">{children}</span>
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
              <Check className="h-2 w-2 text-text-inverse" />
            </span>
          </AddressPinPointer>
        </TimelinePoint>
        <TimelineContent>
          <TimelineTitle size={size}>Created</TimelineTitle>
          <TimelineBody size={size}>
            <TimeAgo datetime={created_at} />
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
                <PenLineIcon className="h-2 w-2 text-text-inverse" />
              </span>
            </AddressPinPointer>
          </TimelinePoint>
          <TimelineContent>
            <TimelineTitle size={size}>Signed</TimelineTitle>
            <TimelineBody size={size}>
              <TimeAgo datetime={created_at} />
            </TimelineBody>
          </TimelineContent>
        </TimelineItem>
      ))}
      <TimelineItem>
        <TimelinePoint size={size}>
          <span className="relative inline-block">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border-warning-weak bg-background-warning p-1">
              <Hourglass className="h-2.5 w-2.5 text-text-inverse" />
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
