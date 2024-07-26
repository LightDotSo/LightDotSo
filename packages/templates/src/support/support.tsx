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

"use client";

import { StateInfoSection } from "@lightdotso/ui";
import { UserIcon } from "lucide-react";
import type { FC } from "react";
import { Cal } from "../cal";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Support: FC = () => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <StateInfoSection
      icon={
        <UserIcon className="mx-auto size-8 rounded-full border border-border p-2 text-text md:size-10" />
      }
      title="Support"
      description="Please reach out to us if you need any help."
    >
      <Cal />
    </StateInfoSection>
  );
};
