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

export const ModeLogo: ForwardRefExoticComponent<
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
    <title>Mode</title>
    <rect width="24" height="24" rx="6" fill="#DFFE00" />
    <g clipPath="url(#clip0_10113_10253)">
      <path
        d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
        fill="#DFFE00"
      />
      <path
        d="M19.1138 18.3187H16.3342V12.0103L17.4473 8.41261L16.6586 8.13199L13.0514 18.3187H10.9374L7.33016 8.13199L6.5416 8.41261L7.65454 12.0103V18.3187H4.875V5.66248H9.01354L11.5806 12.9082V15.0354H12.4194V12.9082L14.9865 5.66248H19.125V18.3187H19.1138Z"
        fill="black"
      />
    </g>
    <defs>
      <clipPath id="clip0_10113_10253">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
));

ModeLogo.displayName = "ModeLogo";
