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

export const ArbitrumNovaLogo: ForwardRefExoticComponent<
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
    <rect width="24" height="24" rx="6" fill="#2D374B" />
    <path
      d="M9.7687 6.9375H8.37767C8.28167 6.9375 8.19591 6.99744 8.16298 7.08752L4.507 17.0967C4.47988 17.171 4.53493 17.25 4.61434 17.25H6.00536C6.10136 17.25 6.18713 17.1901 6.22005 17.1L9.87632 7.09084C9.90343 7.01623 9.8481 6.9375 9.7687 6.9375ZM11.4607 11.1313C11.4242 11.0313 11.2826 11.0313 11.246 11.1313L10.5248 13.1056C10.5063 13.1562 10.5063 13.2114 10.5248 13.262L11.9266 17.0997C11.9595 17.1898 12.0453 17.2497 12.1413 17.2497H13.5323C13.6117 17.2497 13.6668 17.171 13.6397 17.0964L11.4607 11.1313ZM15.0066 13.0639C15.0431 13.1639 15.1848 13.1639 15.2213 13.0639L17.403 7.09084C17.4301 7.01651 17.375 6.9375 17.2956 6.9375H15.9046C15.8086 6.9375 15.7229 6.99744 15.6899 7.08752L14.2854 10.933C14.2668 10.9835 14.2668 11.0388 14.2854 11.0893L15.0066 13.0639ZM12.2641 7.08641C12.2315 6.9969 12.1463 6.9375 12.0511 6.9375H10.6554C10.5594 6.9375 10.4736 6.99744 10.4407 7.08752L6.78469 17.0967C6.75758 17.171 6.81265 17.25 6.89203 17.25H8.28306C8.37906 17.25 8.46482 17.1901 8.49775 17.1L11.2969 9.43641C11.3152 9.38612 11.3866 9.38612 11.4048 9.43641L14.204 17.1C14.237 17.1901 14.3227 17.25 14.4187 17.25H15.8097C15.8891 17.25 15.9442 17.1713 15.9171 17.0967L12.2641 7.08641ZM19.5731 6.9375H18.182C18.086 6.9375 18.0003 6.99744 17.9674 7.08752L15.4241 14.0505C15.4055 14.101 15.4055 14.1563 15.4241 14.2068L16.1453 16.1814C16.1818 16.2814 16.3235 16.2814 16.36 16.1814L18.8775 9.28888L19.6804 7.09084C19.7078 7.01623 19.6524 6.9375 19.5731 6.9375Z"
      fill="#EF8220"
    />
  </svg>
));

ArbitrumNovaLogo.displayName = "ArbitrumNovaLogo";
