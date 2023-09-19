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

import { GlobeAltIcon } from "@heroicons/react/24/outline";

import Image from "next/legacy/image";
import Link from "next/link";
import type { FC } from "react";

import IcomImage from "@/public/icon.png";

export const Protocol: FC = () => {
  return (
    <div className="relative bg-transparent">
      <div className="md:hidden">
        <Image
          priority
          src="/bgFooterLight.svg"
          alt="Planet"
          className="pointer-events-none object-cover object-center"
          layout="fill"
          draggable="false"
        />
      </div>
      <div className="absolute bottom-0 z-0 hidden w-full text-center md:block">
        <Image
          priority
          src="/bgFooterLight.svg"
          alt="Planet"
          width={1920}
          height={960}
          layout="intrinsic"
          objectFit="cover"
          className="pointer-events-none object-cover object-center"
          objectPosition="center bottom"
          draggable="false"
        />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8 lg:py-32">
        <div className="inline-block w-24 lg:w-full">
          <Image
            priority
            src={IcomImage}
            placeholder="blur"
            alt="App Icon"
            width={128}
            height={128}
            draggable="false"
            objectFit="cover"
          />
        </div>
        <h2 className="mt-8 font-clash text-3xl font-extrabold tracking-tight text-bg-dark md:text-4xl xl:text-6xl">
          <span className="block">
            Do. Or do not.
            <br />
            There is no try.
          </span>
        </h2>
        <div className="mt-10 flex justify-center">
          <div className="inline-flex">
            <Link passHref href="/explore" legacyBehavior>
              <button className="inline-flex items-center justify-center rounded-full bg-bg-darker px-5 py-3 text-base font-medium text-contrast-higher hover:bg-bg-light">
                <GlobeAltIcon
                  className="-ml-0.5 mr-2 h-4 w-4"
                  aria-hidden="true"
                />
                Explore now
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
