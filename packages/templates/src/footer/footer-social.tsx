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

import { Social, SOCIAL_LINKS } from "@lightdotso/const";
import { ButtonIcon } from "@lightdotso/ui";
import type { FC, SVGProps } from "react";
import { FaDiscord, FaGithub, FaTwitter } from "react-icons/fa";

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const navigation = {
  social: [
    {
      name: Social.TWITTER,
      href: SOCIAL_LINKS.Twitter,
      icon: (props: SVGProps<SVGSVGElement>) => {
        return <FaTwitter className="text-contrast-medium" {...props} />;
      },
    },
    {
      name: Social.GITHUB,
      href: SOCIAL_LINKS.Github,
      icon: (props: SVGProps<SVGSVGElement>) => {
        return <FaGithub className="text-contrast-medium" {...props} />;
      },
    },
    {
      name: Social.DISCORD,
      href: SOCIAL_LINKS.Discord,
      icon: (props: SVGProps<SVGSVGElement>) => {
        return <FaDiscord className="text-contrast-medium" {...props} />;
      },
    },
  ],
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const FooterSocial: FC = () => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex items-center space-x-2">
      {navigation.social.map(item => {
        return (
          <ButtonIcon key={item.name} asChild variant="shadow" size="sm">
            <a href={item.href} target="_blank" rel="noreferrer">
              <span className="sr-only">{item.name}</span>
              <item.icon className="size-4 fill-text-weak" aria-hidden="true" />
            </a>
          </ButtonIcon>
        );
      })}
    </div>
  );
};
