// Copyright 2023-2024 Light
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

export const CeloLogo: ForwardRefExoticComponent<
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
    <g clipPath="url(#clip0_7984_9126)">
      <rect width="24" height="24" rx="6" fill="#FCFF52" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.3019 7H7V17.37H17.3027V13.75H15.5931C15.0038 15.0709 13.6772 15.9902 12.1591 15.9902C10.0664 15.9902 8.37153 14.2694 8.37153 12.178C8.37153 10.0859 10.0664 8.37977 12.1591 8.37977C13.7066 8.37977 15.0332 9.32933 15.6225 10.6789H17.3027L17.3019 7Z"
        fill="#09090B"
      />
    </g>
    <defs>
      <clipPath id="clip0_7984_9126">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
));

CeloLogo.displayName = "CeloLogo";
