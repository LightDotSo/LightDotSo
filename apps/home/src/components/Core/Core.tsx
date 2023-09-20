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

export const Core: FC = () => {
  return (
    <>
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-4 rounded-lg border border-contrast-lower bg-bg p-4 text-contrast-higher lg:mb-8 lg:p-16">
          <div className="uppercase text-contrast-high lg:mb-2">
            Your Web3 Home
          </div>
          <h2 className="mb-2 text-2xl font-bold lg:mb-4 xl:text-6xl">
            Web3 Hub
          </h2>
          <p className="text-lg text-contrast-high lg:text-2xl">
            We aim to become your tokenal web3 suite. Keep up to date with token
            rewards and explore the world of web3 with zero friction and
            simplicity.
          </p>
          <div className="mt-8 text-center lg:mt-16">
            <Image
              priority
              src="/web3Hub.png"
              alt="Planet"
              width={772}
              height={720}
              layout="intrinsic"
              objectFit="cover"
              className="pointer-events-none object-cover object-center"
              objectPosition="center bottom"
              draggable="false"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl grid-cols-3 gap-8 px-4 lg:mb-4 lg:grid">
        <div className="mb-4 rounded-lg border border-contrast-lower bg-bg p-4 text-contrast-higher lg:p-8 ">
          <div className="mb-2 uppercase text-contrast-high">Staking</div>
          <h2 className="text-lg font-bold xl:text-2xl">
            Super-charged Web3 Credentials
          </h2>
          <div className="mt-8 text-center">
            <Image
              priority
              src="/imgPlanEconomy.svg"
              alt="Planet"
              width={320}
              height={320}
              layout="intrinsic"
              objectFit="cover"
              className="pointer-events-none object-cover object-center"
              objectPosition="center bottom"
              draggable="false"
            />
          </div>
        </div>

        <div className="mb-4 rounded-lg border border-contrast-lower bg-bg p-4 text-contrast-higher lg:p-8">
          <div className="mb-2 uppercase text-contrast-high">Zero Friction</div>
          <h2 className="mb-8 text-lg font-bold xl:text-2xl">
            Instant access without onboarding
          </h2>
          <div className="mt-8 text-center">
            <Image
              priority
              src="/imgPlanStake.svg"
              alt="Planet"
              width={320}
              height={320}
              layout="intrinsic"
              objectFit="cover"
              className="pointer-events-none object-cover object-center"
              objectPosition="center bottom"
              draggable="false"
            />
          </div>
        </div>

        <div className="mb-4 rounded-lg border border-contrast-lower bg-bg p-4 text-contrast-higher lg:p-8">
          <div className="mb-2 uppercase text-contrast-high">
            Social Interactions
          </div>
          <h2 className="text-lg font-bold xl:text-2xl">
            Earn rewards through interacting on web3
          </h2>
          <div className="mt-8 text-center">
            <Image
              priority
              src="/imgCredentials.png"
              alt="Planet"
              width={320}
              height={320}
              layout="intrinsic"
              objectFit="cover"
              className="pointer-events-none object-cover object-center"
              objectPosition="center bottom"
              draggable="false"
            />
          </div>
        </div>
      </div>
    </>
  );
};
