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

"use client";

import { intlFormatDistance } from "date-fns";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface TimeAgoProps {
  value: Date;
}

// -----------------------------------------------------------------------------
// Components
// -----------------------------------------------------------------------------

const TimeAgo: FC<TimeAgoProps> = ({ value }) => {
  const timeString = intlFormatDistance(value, new Date());

  return (
    // eslint-disable-nextline react/jsx-no-useless-fragment
    <>{timeString}</>
  );
};

TimeAgo.displayName = "TimeAgo";

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export { TimeAgo };
