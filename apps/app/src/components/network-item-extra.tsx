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

import { m } from "framer-motion";
import type { FC, MouseEventHandler } from "react";

export type NetworkItemExtraProps = {
  id: string;
  length: number;
  onMouseEnter: MouseEventHandler<HTMLLIElement>;
};

export const NetworkItemExtra: FC<NetworkItemExtraProps> = ({
  id,
  length,
  onMouseEnter,
}) => {
  const item = {
    visible: { opacity: 1, x: 0 },
    hidden: { opacity: 0, x: -10 },
  };

  return (
    <m.li
      id={id}
      style={{
        listStyle: "none",
        marginRight: "-10px",
      }}
      variants={item}
      whileHover={{
        scale: 1.2,
        marginRight: "5px",
        transition: { ease: "easeOut" },
      }}
      onMouseEnter={onMouseEnter}
    >
      <button
        className="mr-1.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-input bg-card text-base font-extrabold text-primary"
        onClick={e => {
          e.stopPropagation();
        }}
      >
        <span>+{length}</span>
      </button>
    </m.li>
  );
};
