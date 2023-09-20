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

/* eslint-disable import/order */

import { GlobeAltIcon, BoltIcon, ScaleIcon } from "@heroicons/react/24/outline";

import ImgFeatureBoardImage from "@/public/imgFeatureBoard.png";
import ImgFeatureConenctImage from "@/public/imgFeatureConnect.png";
import ImgFeatureTimelineImage from "@/public/imgFeatureTimeline.png";
import Image from "next/legacy/image";
import type { FC } from "react";

const features = [
  {
    id: 1,
    name: "NFTs",
    description: "See what your favorite NFT collectors are minting.",
    icon: GlobeAltIcon,
  },
  {
    id: 2,
    name: "DAOs",
    description:
      "See what proposals members of your community are participating in.",
    icon: ScaleIcon,
  },
  {
    id: 3,
    name: "POAPs",
    description:
      "Keep up to date with IRL events that your friends have attended.",
    icon: BoltIcon,
  },
  {
    id: 4,
    name: "DeFi",
    description: "Follow your degnens and hunt for the most underated alpha.",
    icon: BoltIcon,
  },
  {
    id: 5,
    name: "+ More coming soon",
    description: "",
    icon: BoltIcon,
  },
];

export const Feature: FC = () => {
  return (
    <div className="overflow-hidden bg-transparent py-16 lg:py-24">
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="absolute left-full hidden -translate-x-1/4 translate-y-1/4 scale-x-[-1] lg:block">
          <Image
            priority
            src="/bgFeatureLight.svg"
            alt="Light"
            width={1080}
            height={1080}
            layout="fixed"
            draggable="false"
          />
        </div>
        <div className="relative lg:grid lg:grid-cols-2 lg:items-center lg:gap-8">
          <div className="relative">
            <span className="text-sm font-semibold uppercase text-contrast-medium">
              See the light
            </span>
            <h2 className="mt-3 font-clash text-2xl font-extrabold tracking-tight text-gray-100 sm:text-6xl">
              Metaverse Timeline
            </h2>
            <h3 className="mt-3 text-lg text-contrast-medium md:text-2xl">
              Keep up to date with everything that is happening on the
              metaverse.
            </h3>

            <dl className="mt-10 grid grid-cols-2 gap-8">
              {features.map(item => {
                return (
                  <div key={item.id} className="relative">
                    <dt>
                      <p className="text-lg font-medium leading-6 text-contrast-higher">
                        {item.name}
                      </p>
                    </dt>
                    <dd className="mt-2 text-base text-contrast-medium">
                      {item.description}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>

          <div className="relative -mx-4 mt-10 lg:mt-0" aria-hidden="true">
            <Image
              src={ImgFeatureTimelineImage}
              placeholder="blur"
              alt="App Icon"
              width={720}
              height={720}
              draggable="false"
            />
          </div>
        </div>
        <div className="relative mt-12 sm:mt-16 lg:mt-24">
          <div className="absolute right-full hidden translate-x-1/4 translate-y-1/4 lg:block">
            <Image
              priority
              src="/bgFeatureLight.svg"
              alt="Light"
              width={1080}
              height={1080}
              layout="fixed"
              draggable="false"
            />
          </div>
          <div className="lg:grid lg:grid-flow-row-dense lg:grid-cols-2 lg:items-center lg:gap-8">
            <div className="lg:col-start-2">
              <span className="text-sm font-semibold uppercase text-contrast-medium">
                Digital Assets
              </span>
              <h3 className="mt-3 font-clash text-2xl font-extrabold tracking-tight text-gray-100 sm:text-6xl">
                Profile Board
              </h3>
              <p className="mt-3 text-lg text-contrast-medium md:text-2xl">
                Showcase your digital assets in one place.
                <br />
                We aggregate every asset that belongs to you.
              </p>
            </div>

            <div className="relative -mx-4 mt-10 lg:col-start-1 lg:mt-0">
              <Image
                src={ImgFeatureBoardImage}
                placeholder="blur"
                alt="Feature Board"
                width={720}
                height={720}
                draggable="false"
              />
            </div>
          </div>
          <div className="relative mt-12 lg:mt-24 lg:grid lg:grid-cols-2 lg:items-center lg:gap-8">
            <div className="relative">
              <span className="text-sm font-semibold uppercase text-contrast-medium">
                Connect on Web 3.0
              </span>
              <h3 className="mt-3 font-clash text-2xl font-extrabold tracking-tight text-gray-100 sm:text-6xl">
                Social graph
              </h3>
              <p className="mt-3 text-lg text-contrast-medium md:text-2xl">
                Follow your favorite people on the blockchain. <br />
                Discover connections that was previously not possible before.
              </p>
            </div>
            <div className="relative -mx-4 mt-10 lg:mt-0" aria-hidden="true">
              <Image
                src={ImgFeatureConenctImage}
                placeholder="blur"
                alt="Feature Connect"
                width={720}
                height={720}
                draggable="false"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
