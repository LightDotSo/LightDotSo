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

const tokens = [
  {
    name: "$LXP",
    title: "Utility Token",
    email: "Unlimited supply",
    image: "/$lxp.svg",
  },
  {
    name: "$LIGHT",
    title: "Governance Token",
    email: "Total supply 300 billion",
    image: "/$light.svg",
  },
];

export const Token: FC = () => {
  return (
    <div className="container mx-auto mb-8 max-w-7xl px-4">
      <div className="rounded-lg border border-contrast-lower bg-bg p-4 text-contrast-higher lg:p-8">
        <h2 className="text-lg font-bold xl:text-4xl">Tokens</h2>
        <div className="mt-8 flex flex-col">
          <div className="-my-2 overflow-x-auto lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden ">
                <table className="min-w-full divide-y divide-contrast-lower">
                  <thead className="">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pr-3 text-left font-semibold uppercase text-contrast-high"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold uppercase text-contrast-high"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold uppercase text-contrast-high"
                      >
                        Supply
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-contrast-lower">
                    {tokens.map(token => {
                      return (
                        <tr key={token.email}>
                          <td className="flex items-center whitespace-nowrap py-8 pr-3 font-bold">
                            <div className="mr-8">
                              <Image
                                priority
                                src={token.image}
                                alt="$light"
                                width={48}
                                height={48}
                                layout="fixed"
                                className="pointer-events-none object-cover object-center "
                                objectPosition="center"
                                draggable="false"
                              />
                            </div>
                            {token.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-8">
                            {token.title}
                          </td>
                          <td className="whitespace-nowrap px-3 py-8">
                            {token.email}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
