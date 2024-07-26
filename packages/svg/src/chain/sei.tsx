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

export const SeiLogo: ForwardRefExoticComponent<
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
    <title>Sei</title>
    <rect width="24" height="24" rx="6" fill="#001B2A" />
    <g clip-path="url(#clip0_10359_6711)">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M11.995 20.9578C14.6556 20.9578 17.0459 19.8006 18.6902 17.962C17.9253 17.2973 16.7727 17.2568 15.9584 17.914L15.8029 18.0394C14.312 19.2424 12.1397 19.0647 10.8641 17.6355C10.1684 16.856 8.9769 16.7765 8.1837 17.4565L6.3902 18.9941C7.92631 20.223 9.87484 20.9578 11.995 20.9578ZM14.9062 16.6099C16.3262 15.4641 18.3221 15.5052 19.6879 16.6118C20.5043 15.2593 20.9739 13.6739 20.9739 11.9789C20.9739 10.0954 20.3941 8.34743 19.403 6.90367C18.7641 6.76761 18.0716 6.92652 17.5459 7.39233L17.3964 7.52491C15.9626 8.79543 13.7844 8.71821 12.4442 7.3494C11.7133 6.60285 10.5194 6.57833 9.75839 7.29426L7.67129 9.25777L6.52316 8.03738L8.61025 6.07386C10.0357 4.73276 12.2722 4.77869 13.6414 6.17717C14.3569 6.9079 15.5197 6.94912 16.2851 6.27086L16.4347 6.13829C16.8993 5.72658 17.4368 5.44902 17.9996 5.30306C16.4089 3.87132 14.3037 3 11.995 3C7.43697 3 3.6722 6.39632 3.0933 10.7963C4.47776 10.1319 6.18547 10.3876 7.31431 11.5436C8.02694 12.2733 9.17439 12.3503 9.97817 11.7224L11.1451 10.8107C12.6117 9.66498 14.6848 9.72044 16.088 10.943L18.3599 12.9224L17.2593 14.1857L14.9873 12.2063C14.1895 11.5112 13.0106 11.4796 12.1767 12.1311L11.0097 13.0428C9.53296 14.1965 7.42479 14.055 6.1155 12.7142C5.35415 11.9345 4.10896 11.9074 3.31429 12.653L3.06177 12.89C3.25075 14.7653 4.01682 16.4704 5.17969 17.8248L7.0931 16.1844C8.57899 14.9105 10.8109 15.0596 12.1142 16.5198C12.7952 17.2827 13.9548 17.3776 14.7507 16.7354L14.9062 16.6099Z"
        fill="url(#paint0_linear_10359_6711)"
      />
    </g>
    <defs>
      <linearGradient
        id="paint0_linear_10359_6711"
        x1="12.0028"
        y1="20.882"
        x2="12.0028"
        y2="3"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#B52A2A" />
        <stop offset="1" stop-color="#780000" />
      </linearGradient>
      <clipPath id="clip0_10359_6711">
        <rect width="18" height="18" fill="white" transform="translate(3 3)" />
      </clipPath>
    </defs>
  </svg>
));

SeiLogo.displayName = "SeiLogo";
