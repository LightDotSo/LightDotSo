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

export const About: FC = () => {
  return (
    <div className="text-center">
      <div className="container relative mx-auto px-4 pt-32 lg:pt-48">
        ƒ
        <div className="absolute inset-0 w-full">
          <Image
            priority
            src="/bgHeroPlanet.svg"
            alt="Planet"
            width={1280}
            height={1280}
            className="pointer-events-none object-cover object-center"
            layout="intrinsic"
            draggable="false"
          />
        </div>
        <div className="relative z-10 text-center">
          <span className="inline-block rounded-full border px-3 py-1 text-base font-semibold tracking-wide text-contrast-higher">
            light.so
          </span>
          <h2 className="mt-3 font-clash text-4xl font-extrabold text-contrast-higher sm:tracking-tight xl:text-7xl">
            Enter a new era
            <br />
            of Web 3.0
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-contrast-medium md:text-2xl">
            We enable users to curate, discover, and explore meaningful
            interactions on the metaverse in a way that was not possible before.
          </p>
        </div>
        <div className="relative">
          <div className="absolute inset-0 z-10 my-auto">
            <Image
              priority
              src="/imgAbout.png"
              alt="Enter a new era"
              width={960}
              height={960}
              layout="intrinsic"
              draggable="false"
            />
          </div>
          <div className="relative inset-0 z-0">
            <Image
              priority
              src="/imgBgAbout.svg"
              alt="Enter a new era"
              width={960}
              height={960}
              layout="intrinsic"
              draggable="false"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
