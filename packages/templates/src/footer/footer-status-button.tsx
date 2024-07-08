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

import { INTERNAL_LINKS } from "@lightdotso/const";
import { Button } from "@lightdotso/ui";
import { MonitorCheck } from "lucide-react";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const FooterStatusButton: FC = () => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex items-center">
      <Button asChild size="xs" variant="ghost">
        <a href={INTERNAL_LINKS["Status"]} target="_blank" rel="noreferrer">
          <MonitorCheck className="size-4 text-text-info" />
          <span className="ml-2 text-xs text-text-info-strong">
            All systems normal.
          </span>
        </a>
      </Button>
    </div>
  );
};
