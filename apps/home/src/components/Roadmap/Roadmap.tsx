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

import Image from "next/legacy/image";
import type { FC } from "react";

export const Roadmap: FC = () => {
  return (
    <div className="container mx-auto max-w-7xl px-4">
      <div className="overflow-x-auto rounded-lg border border-contrast-lower bg-bg p-4 text-contrast-higher lg:p-8">
        <h2 className="mb-8 text-lg font-bold xl:text-4xl">Roadmap</h2>
        <Image
          priority
          src="/roadmap.svg"
          alt="Planet"
          width={1188}
          height={346}
          layout="intrinsic"
          objectFit="cover"
          className="pointer-events-none object-cover object-center"
          objectPosition="center bottom"
          draggable="false"
        />
      </div>
    </div>
  );
};
