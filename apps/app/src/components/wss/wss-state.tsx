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

"use client";

import { useEffect } from "react";
import type { FC } from "react";
import { pusherClient } from "@/clients/pusher";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const WssState: FC = () => {
  useEffect(() => {
    // Subscribe to a channel
    const channel = pusherClient.subscribe("test-channel");

    // Bind to an event on the channel
    channel.bind("test-event", function (data: any) {
      console.info("test-event data:", data);
    });

    // Unsubscribe from the channel when the component unmounts
    return () => {
      channel.unbind("test-event");
      pusherClient.unsubscribe("test-channel");
    };
  }, []);

  return null;
};
