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
import type { FC } from "react";
import TimeAgo from "timeago-react";
import { PlaceholderOrb } from "@/components/lightdotso/placeholder-orb";
import type { UserOperationData } from "@/data";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type UserOperationTimelineProps = { userOperation: UserOperationData };

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const UserOperationTimeline: FC<UserOperationTimelineProps> = ({
  userOperation: { created_at, signatures },
}) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Timeline>
      <TimelineItem>
        <TimelinePoint>
          <Avatar className="h-6 w-6">
            <PlaceholderOrb
              address={"0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed"}
            />
          </Avatar>
        </TimelinePoint>
        <TimelineContent>
          <TimelineTitle>Created</TimelineTitle>
          <TimelineBody>
            <TimeAgo datetime={created_at} />
          </TimelineBody>
        </TimelineContent>
      </TimelineItem>
      {signatures.map(({ created_at, owner_id }) => (
        <TimelineItem key={owner_id}>
          <TimelinePoint>
            <Avatar className="h-6 w-6">
              <PlaceholderOrb
                address={"0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed"}
              />
            </Avatar>
          </TimelinePoint>
          <TimelineContent>
            <TimelineTitle>Signed</TimelineTitle>
            <TimelineBody>
              <TimeAgo datetime={created_at} />
            </TimelineBody>
          </TimelineContent>
        </TimelineItem>
      ))}
      <TimelineItem>
        <TimelinePoint>
          <span className="inline-flex h-6 w-6 rounded-full border border-dashed border-border-warning p-1" />
        </TimelinePoint>
        <TimelineContent>
          <TimelineTitle>Waiting for Execution</TimelineTitle>
          <TimelineBody>
            Can be executed once threshold is reached.
          </TimelineBody>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  );
};
