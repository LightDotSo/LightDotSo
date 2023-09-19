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

export const Plan: FC = () => {
  return (
    <div className="relative z-10 px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-28 lg:pt-24">
      <div className="absolute inset-0">
        <div className="h-1/3 sm:h-2/3" />
      </div>
      <div className="container relative mx-auto">
        <div className="mb-16 text-left">
          <span className="text-sm font-semibold uppercase text-contrast-medium">
            On the horizon...
          </span>
          <h2 className="mt-3 font-clash text-3xl font-extrabold tracking-tight text-white md:text-6xl">
            Light Protocol
          </h2>
        </div>
        <div className="grid gap-4 overflow-hidden md:grid-cols-3 md:grid-rows-2 lg:gap-8">
          <div className="row-span-2 rounded-xl border border-contrast-lower bg-bg-dark p-4 text-contrast-higher lg:p-8">
            <span className="text-sm font-semibold uppercase text-contrast-medium">
              Visualize
            </span>
            <h3 className="mt-3 text-xl font-bold lg:text-3xl">
              One account for all of your web3 credentials.
            </h3>
            <div className="text-center">
              <Image
                priority
                src="/imgPlanEconomy.svg"
                alt="Enter a new era"
                width={320}
                height={320}
                layout="intrinsic"
                draggable="false"
              />
            </div>
          </div>
          <div className="row-span-2 rounded-xl border border-contrast-lower bg-bg-dark p-4 text-contrast-higher lg:p-8">
            <span className="text-sm font-semibold uppercase text-contrast-medium">
              Earn
            </span>
            <h3 className="mt-3 text-xl font-bold lg:text-3xl">
              Earn rewards through your web 3.0 activity
            </h3>
            <div className="text-center">
              <Image
                priority
                src="/imgPlanStake.svg"
                alt="Enter a new era"
                width={320}
                height={320}
                layout="intrinsic"
                draggable="false"
              />
            </div>
          </div>
          <div className="col-end-auto rounded-xl border border-contrast-lower bg-bg-dark p-4 text-contrast-higher lg:p-8">
            <span className="text-sm font-semibold uppercase text-contrast-medium">
              Light App
            </span>
            <h3 className="mt-3 text-xl font-bold lg:text-3xl">
              The most humane and transparent way to interact with web3
            </h3>
          </div>
          <div className="col-end-auto rounded-xl border border-contrast-lower bg-bg-dark p-4 text-contrast-higher lg:p-8">
            <span className="text-sm font-semibold uppercase text-contrast-medium">
              Chain Agnostic
            </span>
            <h3 className="mt-3 text-xl font-bold lg:text-3xl">
              + Avalanche
              <br />
              + Cosmos
              <br />
              + Solana
              <br />
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};
