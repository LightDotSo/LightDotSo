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

import type {
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
  SVGProps,
} from "react";
import { forwardRef } from "react";

export const BlastLogo: ForwardRefExoticComponent<
  PropsWithoutRef<SVGProps<SVGSVGElement>> & RefAttributes<SVGSVGElement>
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
    <g clipPath="url(#clip0_7987_9178)">
      <rect width="24" height="24" rx="6" fill="#FCFC03" />
      <path
        d="M16.8026 11.8613L19.1647 10.6843L19.979 8.1851L18.3505 7H7.50725L5 8.8623H17.7458L17.0686 10.9584H11.9574L11.4656 12.4901H16.5769L15.1419 16.9L17.5362 15.7149L18.3908 13.0706L16.7865 11.8936L16.8026 11.8613Z"
        fill="#09090B"
      />
      <path
        d="M8.6037 15.0055L10.079 10.4102L8.44246 9.18481L5.98358 16.9H15.1419L15.7546 15.0055H8.6037Z"
        fill="#09090B"
      />
    </g>
    <defs>
      <clipPath id="clip0_7987_9178">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
));

BlastLogo.displayName = "BlastLogo";
