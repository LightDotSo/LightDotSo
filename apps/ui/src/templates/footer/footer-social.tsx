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
import { LightHorizontalLogo } from "../../svgs/logo/light-horizontal";

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
    <div className="space-y-8 xl:col-span-1">
      <div className="inline-flex items-center pb-3 text-text">
        <LightHorizontalLogo className="block h-10 w-auto" />
      </div>
      <div className="flex space-x-6">
        {navigation.social.map(item => {
          return (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="text-text-weak hover:text-text"
            >
              <span className="sr-only">{item.name}</span>
              <item.icon className="h-6 w-6" aria-hidden="true" />
            </a>
          );
        })}
      </div>
    </div>
  );
};
