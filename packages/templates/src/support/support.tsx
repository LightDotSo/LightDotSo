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
              href={SOCIAL_LINKS["Discord"]}
              target="_blank"
              rel="noopener noreferrer"
            >
              <DiscordLogoIcon className="size-4" />
            </a>
          </ButtonIcon>
          <ButtonIcon asChild variant="shadow">
            <a
              href={SOCIAL_LINKS["Telegram Support"]}
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
