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

import { addons } from "@storybook/preview-api";
import { useEffect, useState } from "react";
import { DARK_MODE_EVENT_NAME } from "storybook-dark-mode";

// ---------------------------------------------------------------------------
// Utils
// ---------------------------------------------------------------------------

const channel = addons.getChannel();

// From: https://github.com/hipstersmoothie/storybook-dark-mode/issues/282#issuecomment-2246463856

export function useDarkMode() {
  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [isDark, setDark] = useState(false);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    channel.on(DARK_MODE_EVENT_NAME, setDark);
    return () => channel.off(DARK_MODE_EVENT_NAME, setDark);
  }, [channel, setDark]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return isDark;
}
