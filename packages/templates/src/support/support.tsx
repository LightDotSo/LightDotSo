// Copyright 2023-2024 Light, Inc.
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

import { SOCIAL_LINKS } from "@lightdotso/const";
import { ButtonIcon, StateInfoSection } from "@lightdotso/ui";
import { DiscordLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons";
import { UserIcon } from "lucide-react";
import { type FC } from "react";
import { PiTelegramLogoDuotone } from "react-icons/pi";

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
      <div className="jusfity-center flex w-full flex-col items-center">
        <div className="flex gap-2">
          <ButtonIcon asChild variant="shadow">
            <a
              href={SOCIAL_LINKS["Twitter Shun"]}
              target="_blank"
              rel="noopener noreferrer"
            >
              <TwitterLogoIcon className="size-4" />
            </a>
          </ButtonIcon>
          <ButtonIcon asChild variant="shadow">
            <a
              href={SOCIAL_LINKS.Discord}
              target="_blank"
              rel="noopener noreferrer"
            >
              <DiscordLogoIcon className="size-4" />
            </a>
          </ButtonIcon>
          <ButtonIcon asChild variant="shadow">
            <a
              href={SOCIAL_LINKS.Telegram}
              target="_blank"
              rel="noopener noreferrer"
            >
              <PiTelegramLogoDuotone className="size-4" />
            </a>
          </ButtonIcon>
        </div>
        <div className="mt-2">
          <p className="text-xs text-text-weak">
            Or book a time here to chat with us{" "}
            <a
              href={SOCIAL_LINKS["Cal Shun"]}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:font-semibold"
            >
              here
            </a>{" "}
            if it&apos;s an urgent matter.
          </p>
        </div>
      </div>
    </StateInfoSection>
  );
};
