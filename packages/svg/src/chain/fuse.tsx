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

export const FuseLogo: ForwardRefExoticComponent<
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
    <title>Fuse</title>
    <g clip-path="url(#clip0_10113_10207)">
      <mask
        id="mask0_10113_10207"
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="24"
        height="24"
      >
        <path
          d="M23.8553 0.0263062H0.144653V23.7369H23.8553V0.0263062Z"
          fill="white"
        />
      </mask>
      <g mask="url(#mask0_10113_10207)">
        <path
          d="M23.8553 0.0854492H0.203857V23.7369H23.8553V0.0854492Z"
          fill="#B4F9BA"
        />
        <path
          d="M9.64567 6.04412L11.9317 4.72395C11.9968 4.68642 12.0775 4.68642 12.1426 4.72395L18.1675 8.20242C18.2326 8.23998 18.2727 8.30947 18.2733 8.38459L18.2814 10.777C18.2814 10.8527 18.2414 10.9228 18.1756 10.9604L15.8928 12.2787C15.7526 12.3601 15.5767 12.2587 15.576 12.0965L15.5685 9.94948C15.5685 9.87438 15.5278 9.80489 15.4627 9.76733L9.64567 6.40967C9.50483 6.3283 9.50483 6.1255 9.64567 6.04412Z"
          fill="#010101"
        />
        <path
          d="M8.16901 16.8807L5.88363 15.5611C5.81791 15.5236 5.77783 15.4541 5.77783 15.3784V8.42142C5.77783 8.3463 5.81791 8.27684 5.88301 8.23863L7.95117 7.03492C8.01689 6.99674 8.09766 6.99674 8.16276 7.03492L10.4456 8.35319C10.5858 8.43457 10.5865 8.63675 10.4463 8.71874L8.59091 9.79855C8.5258 9.83608 8.48576 9.90557 8.48576 9.98131V16.6985C8.48576 16.8612 8.30986 16.9627 8.16901 16.8813V16.8807Z"
          fill="#010101"
        />
        <path
          d="M18.2813 12.7387V15.3778C18.2813 15.4535 18.2412 15.523 18.1755 15.5605L12.1506 19.039C12.0855 19.0766 12.0054 19.0766 11.9403 19.039L9.86398 17.8497C9.79826 17.8121 9.75757 17.742 9.75757 17.6663V15.0304C9.75757 14.8682 9.93285 14.7668 10.0737 14.8469L11.9365 15.9142C12.0017 15.9518 12.0818 15.9511 12.1469 15.9142L17.9639 12.5553C18.1048 12.4739 18.2807 12.5753 18.2807 12.7381L18.2813 12.7387Z"
          fill="#010101"
        />
      </g>
    </g>
    <defs>
      <clipPath id="clip0_10113_10207">
        <rect width="24" height="24" rx="6" fill="white" />
      </clipPath>
    </defs>
  </svg>
));

FuseLogo.displayName = "FuseLogo";
