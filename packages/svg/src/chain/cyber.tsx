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

export const CyberLogo: ForwardRefExoticComponent<
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
    <title>Cyber</title>
    <g clipPath="url(#clip0_11397_17351)">
      <path
        d="M11.9723 7.71341C14.3336 7.71341 16.2482 9.63211 16.2482 11.9986C16.2482 14.3651 14.3336 16.2839 11.9723 16.2839C9.61101 16.2839 7.69651 14.3651 7.69651 11.9986C7.69651 9.63211 9.61101 7.71341 11.9723 7.71341ZM11.9723 0C10.3593 0 8.79111 0.318178 7.30954 0.945964C5.88248 1.55019 4.60294 2.41473 3.50619 3.51388C2.40943 4.61305 1.54678 5.8954 0.943891 7.32559C0.317481 8.80935 0 10.382 0 11.9986C0 13.6152 0.317481 15.1868 0.943891 16.6716C1.54678 18.1019 2.40943 19.3842 3.50619 20.4833C4.60294 21.5826 5.88248 22.447 7.30954 23.0513C8.79005 23.6791 10.3593 23.9973 11.9723 23.9973C13.5854 23.9973 15.1536 23.6791 16.6352 23.0513C18.0622 22.447 19.3417 21.5826 20.4385 20.4833C21.5352 19.3842 22.3979 18.1019 23.0008 16.6716C23.6272 15.1879 23.9447 13.6152 23.9447 11.9986C23.9447 10.382 23.6272 8.81042 23.0008 7.32559C22.3979 5.8954 21.5352 4.61305 20.4385 3.51388C19.3417 2.41473 18.0622 1.55019 16.6352 0.945964C15.1546 0.318178 13.5854 0 11.9723 0Z"
        fill="#B7F7B0"
      />
      <path
        d="M11.9722 7.71331C14.3336 7.71331 16.2481 9.63201 16.2481 11.9986C16.2481 14.365 14.3336 16.2838 11.9722 16.2838C9.61094 16.2838 7.69644 14.365 7.69644 11.9986C7.69644 9.63201 9.61094 7.71331 11.9722 7.71331ZM11.9722 2.57104C6.78568 2.57104 2.56543 6.80056 2.56543 11.9986C2.56543 17.1965 6.78568 21.426 11.9722 21.426C17.1588 21.426 21.3791 17.1965 21.3791 11.9986C21.3791 6.80056 17.1588 2.57104 11.9722 2.57104Z"
        fill="#07DC10"
      />
      <path
        d="M11.9722 7.71347C14.3336 7.71347 16.248 9.63218 16.248 11.9987C16.248 14.3652 14.3336 16.284 11.9722 16.284C9.61086 16.284 7.69636 14.3652 7.69636 11.9987C7.69636 9.63218 9.61086 7.71347 11.9722 7.71347ZM11.9722 5.14233C8.19984 5.14233 5.13086 8.21806 5.13086 11.9987C5.13086 15.7793 8.19984 18.855 11.9722 18.855C15.7446 18.855 18.8136 15.7793 18.8136 11.9987C18.8136 8.21806 15.7446 5.14233 11.9722 5.14233Z"
        fill="#0C9B00"
      />
      <path
        d="M11.9722 7.71338C14.3335 7.71338 16.248 9.63209 16.248 11.9986C16.248 14.3651 14.3335 16.2839 11.9722 16.2839C9.61079 16.2839 7.69629 14.3651 7.69629 11.9986C7.69629 9.63209 9.61079 7.71338 11.9722 7.71338Z"
        fill="#EAEAEA"
      />
    </g>
    <defs>
      <clipPath id="clip0_11397_17351">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
));

CyberLogo.displayName = "CyberLogo";
