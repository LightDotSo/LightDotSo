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

export const RedstoneLogo: ForwardRefExoticComponent<
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
    <g clip-path="url(#clip0_11397_17461)">
      <rect width="24" height="24" rx="6" fill="#F34242" />
      <path opacity="0.75" d="M6 9V6H9V9H6Z" fill="white" />
      <path d="M6 12V9H9V12H6Z" fill="white" />
      <path d="M6 15V12H9V15H6Z" fill="white" />
      <path opacity="0.75" d="M6 18V15H9V18H6Z" fill="white" />
      <path opacity="0.75" d="M15 9V6H18V9H15Z" fill="white" />
      <path d="M15 12V9H18V12H15Z" fill="white" />
      <path d="M15 15V12H18V15H15Z" fill="white" />
      <path opacity="0.75" d="M15 18V15H18V18H15Z" fill="white" />
      <path d="M12 18H9V15H12V18Z" fill="white" />
      <path d="M15 18H12V15H15V18Z" fill="white" />
      <path d="M12 9H9V6H12V9Z" fill="white" />
      <path d="M15 9H12V6H15V9Z" fill="white" />
      <path opacity="0.25" d="M9 0V3H12V0H9Z" fill="white" />
      <path opacity="0.75" d="M12 21V18H15V21H12Z" fill="white" />
      <path opacity="0.75" d="M21 12H18V15H21V12Z" fill="white" />
      <path opacity="0.75" d="M3 12H6V15H3V12Z" fill="white" />
      <path opacity="0.75" d="M12 3V6H15V3H12Z" fill="white" />
      <path opacity="0.25" d="M12 0V3H15V0H12Z" fill="white" />
      <path opacity="0.25" d="M9 24V21H12V24H9Z" fill="white" />
      <path opacity="0.25" d="M12 24V21H15V24H12Z" fill="white" />
      <path opacity="0.25" d="M24 9H21V12H24V9Z" fill="white" />
      <path opacity="0.25" d="M24 12H21V15H24V12Z" fill="white" />
      <path opacity="0.25" d="M0 12H3V15H1.31134e-07L0 12Z" fill="white" />
      <path opacity="0.25" d="M0 9H3V12H1.31134e-07L0 9Z" fill="white" />
      <path opacity="0.75" d="M9 3V6H12V3H9Z" fill="white" />
      <path opacity="0.75" d="M9 21V18H12V21H9Z" fill="white" />
      <path opacity="0.75" d="M21 9H18V12H21V9Z" fill="white" />
      <path opacity="0.75" d="M3 9H6V12H3V9Z" fill="white" />
    </g>
    <defs>
      <clipPath id="clip0_11397_17461">
        <rect width="24" height="24" rx="6" fill="white" />
      </clipPath>
    </defs>
  </svg>
));

RedstoneLogo.displayName = "RedstoneLogo";
