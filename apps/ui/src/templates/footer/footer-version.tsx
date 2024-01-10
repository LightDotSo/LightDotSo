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

import { SOCIAL_LINKS } from "@lightdotso/const";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const FooterVersion: FC = () => {
  return (
    <div className="flex items-center justify-between space-x-2">
      <span className="text-xs text-text-weak/60">
        Version:{" "}
        <a
          className="text-text-weak hover:underline"
          href={`${SOCIAL_LINKS.Github}/releases/tag/${process.env.NEXT_PUBLIC_APP_VERSION}`}
          target="_blank"
          rel="noreferrer"
        >
          v
          {process.env.NEXT_PUBLIC_APP_VERSION?.match(/(\d+\.\d+\.\d+)/)?.[0] ??
            "0.0.0"}
        </a>{" "}
        {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA && (
          <a
            className="hover:underline"
            target="_blank"
            rel="noreferrer"
            href={SOCIAL_LINKS.Github}
          >
            ({process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA.slice(0, 7)})
          </a>
        )}
      </span>
    </div>
  );
};
