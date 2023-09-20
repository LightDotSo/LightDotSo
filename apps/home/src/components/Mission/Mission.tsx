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

import type { FC } from "react";

export const Mission: FC = () => {
  return (
    <div className="container mx-auto my-16 max-w-7xl px-4 md:my-32">
      <div className="text-contrast-higher">
        <div className="mb-2 uppercase text-contrast-high">Our Mission</div>
        <h2 className="mb-8 max-w-4xl text-4xl font-bold md:mb-16 xl:text-6xl">
          Onboard the{" "}
          <span className="bg-gradient-to-r from-contrast-higher via-primary to-primary-dark bg-clip-text text-transparent">
            next billion people
          </span>{" "}
          to web3
        </h2>
        <div className="to-primary-dark/0 h-[2px] bg-gradient-to-r from-contrast-higher via-primary" />
      </div>
    </div>
  );
};
