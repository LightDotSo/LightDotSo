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

import { forwardRef } from "react";

export const EthereumLogo: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> &
    React.RefAttributes<SVGSVGElement>
> = forwardRef((props, ref) => (
  <svg
    {...props}
    ref={ref}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="1" y="1" width="22" height="22" rx="6" fill="#8E90FF" />
    <path
      d="M8 12.111L11.998 6V6.003L12 6L15.998 12.11L16 12.111L12.002 14.288H12L8 12.111Z"
      fill="white"
    />
    <path
      d="M11.998 17.997V18L8 12.81L11.998 14.986H12L16 12.81L12 18L11.998 17.997Z"
      fill="white"
    />
  </svg>
));

EthereumLogo.displayName = "EthereumLogo";
