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

export const Hero: FC = () => {
  return (
    <div className="relative h-full text-center">
      <div className="md:hidden">
        <Image
          priority
          src="/bgHeroLight.svg"
          alt="Light"
          className="pointer-events-none object-cover object-center"
          layout="fill"
        />
      </div>
      <div className="absolute inset-x-0 top-32 z-[0] hidden text-center md:-top-48 md:block xl:-top-48 2xl:-top-96">
        <Image
          priority
          src="/bgHeroLight.svg"
          alt="Light"
          width={1920}
          height={1920}
          layout="intrinsic"
          objectFit="cover"
          className="pointer-events-none object-cover object-center"
          objectPosition="center top"
          draggable="false"
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 z-0 md:bottom-0 xl:bottom-32 2xl:top-40">
        <Image
          priority
          src="/bgHeroPlanets.svg"
          alt="Light"
          width={1920}
          height={960}
          layout="intrinsic"
          className="pointer-events-none object-cover object-center"
        />
      </div>
      <div className="container relative mx-auto px-4 pb-48 pt-32 md:py-24 lg:px-8 lg:py-32 xl:pb-64 xl:pt-80">
        <div className="relative z-20 px-8 text-center sm:px-16">
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
          <h1 className="mt-8 font-clash text-4xl font-bold text-bg-light sm:text-5xl sm:tracking-tight lg:text-5xl xl:text-7xl">
            The Metaverse Explorer
          </h1>
          <p className="mx-auto mb-12 mt-5 max-w-xl text-xl text-contrast-lower lg:text-3xl">
            Light enables users to discover connections that was not possible
            before.
          </p>
          <Link passHref legacyBehavior href="/explore">
            <button className="inline-flex items-center rounded-full bg-bg-darker px-6 py-3 text-base font-medium text-contrast-higher shadow-sm hover:bg-bg-light">
              <GlobeAltIcon
                className="-ml-0.5 mr-2 h-4 w-4"
                aria-hidden="true"
              />
              <span className="text-3xl">&nbsp;</span>
              Explore now
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
