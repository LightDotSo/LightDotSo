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

import { SOCIAL_LINKS } from "@lightdotso/const";
import { Button } from "@lightdotso/ui/components/button";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const BetaVersion: FC = () => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex items-center justify-between space-x-2">
      <span className="text-text">
        Public Beta{" "}
        <Button asChild size="xs">
          <a
            className="text-text-weak"
            href={`${SOCIAL_LINKS.Github}/releases/tag/${process.env.NEXT_PUBLIC_LIGHT_VERSION}`}
            target="_blank"
            rel="noreferrer"
          >
            v
            {process.env.NEXT_PUBLIC_LIGHT_VERSION?.match(
              /(\d+\.\d+\.\d+)/,
            )?.[0] ?? "0.0.0"}
          </a>
        </Button>
      </span>
    </div>
  );
};
