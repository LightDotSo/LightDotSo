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

import { Social, SOCIAL_LINKS } from "@lightdotso/const";
import type { FC, SVGProps } from "react";
import { FaDiscord, FaGithub, FaTwitter } from "react-icons/fa";
import { ButtonIcon } from "../../components/ui/button-icon";

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
  return (
    <div className="flex space-x-2 items-center">
      {navigation.social.map(item => {
        return (
          <ButtonIcon key={item.name} asChild variant="shadow" size="sm">
            <a href={item.href} target="_blank" rel="noreferrer">
              <span className="sr-only">{item.name}</span>
              <item.icon
                className="h-4 w-4 fill-text-weak"
                aria-hidden="true"
              />
            </a>
          </ButtonIcon>
        );
      })}
    </div>
  );
};
