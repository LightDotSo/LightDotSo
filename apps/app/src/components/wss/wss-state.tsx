// Copyright 2023-2024 Light.
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

"use client";

import { pusherClient } from "@lightdotso/pusher";
import { useEffect } from "react";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const WssState: FC = () => {
  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    // Subscribe to a channel
    const channel = pusherClient.subscribe("test-channel");

    // Bind to an event on the channel
    // channel.bind("test-event", function (data: any) {
    //   console.info("test-event data:", data);
    // });

    // Unsubscribe from the channel when the component unmounts
    return () => {
      channel.unbind("test-event");
      pusherClient.unsubscribe("test-channel");
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return null;
};
