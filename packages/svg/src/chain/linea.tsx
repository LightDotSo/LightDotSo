// Copyright 2023-2024 LightDotSo.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import type {
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
  SVGProps,
} from "react";
import { forwardRef } from "react";

export const LineaLogo: ForwardRefExoticComponent<
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
    <g clip-path="url(#clip0_10113_10105)">
      <g clip-path="url(#clip1_10113_10105)">
        <rect width="24" height="24" rx="6" fill="#121212" />
        <mask
          id="mask0_10113_10105"
          maskUnits="userSpaceOnUse"
          x="6"
          y="6"
          width="12"
          height="12"
        >
          <path d="M17.9449 6H6V17.9973H17.9449V6Z" fill="white" />
        </mask>
        <g mask="url(#mask0_10113_10105)">
          <path
            d="M15.9203 17.9973H6V7.94678H8.26976V16.0495H15.9203V17.9963V17.9973Z"
            fill="white"
          />
          <path
            d="M15.9203 9.89355C17.0384 9.89355 17.9449 9.02196 17.9449 7.94678C17.9449 6.8716 17.0384 6 15.9203 6C14.802 6 13.8956 6.8716 13.8956 7.94678C13.8956 9.02196 14.802 9.89355 15.9203 9.89355Z"
            fill="white"
          />
        </g>
      </g>
    </g>
    <defs>
      <clipPath id="clip0_10113_10105">
        <rect width="24" height="24" fill="white" />
      </clipPath>
      <clipPath id="clip1_10113_10105">
        <rect width="24" height="24" rx="6" fill="white" />
      </clipPath>
    </defs>
  </svg>
));

LineaLogo.displayName = "LineaLogo";
