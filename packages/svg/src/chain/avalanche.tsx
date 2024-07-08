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

export const AvalancheLogo: ForwardRefExoticComponent<
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
    <rect x="1" y="1" width="22" height="22" rx="6" fill="#E84242" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.9224 16.1626H8.04567C7.60071 16.1626 7.37822 16.1626 7.24498 16.0764C7.10098 15.9833 7.01012 15.8271 7.0005 15.656C6.99157 15.4976 7.10177 15.3046 7.32216 14.9185L11.4312 7.71983C11.6549 7.32802 11.7667 7.13211 11.909 7.05918C12.0627 6.9804 12.245 6.98026 12.3988 7.05884C12.5412 7.13154 12.6533 7.3273 12.8775 7.71877L13.8252 9.37337C13.9882 9.65801 14.0697 9.8004 14.1056 9.95056C14.1446 10.114 14.1447 10.2844 14.1058 10.4478C14.0701 10.5981 13.9887 10.7405 13.8259 11.0253L11.3688 15.3238C11.2036 15.6128 11.121 15.7573 11.0078 15.8653C10.8846 15.9828 10.7353 16.0695 10.572 16.118C10.422 16.1626 10.2555 16.1626 9.9224 16.1626ZM16.618 16.1626H14.4421C13.9932 16.1626 13.7686 16.1626 13.635 16.0757C13.4906 15.9818 13.4 15.8243 13.3914 15.6524C13.3835 15.4933 13.4965 15.2994 13.7225 14.9118L14.8086 13.0484C15.0317 12.6656 15.1433 12.4742 15.2846 12.4025C15.4372 12.325 15.6177 12.3249 15.7705 12.4022C15.9119 12.4736 16.0237 12.6649 16.2473 13.0472L17.3371 14.9107C17.5639 15.2986 17.6773 15.4926 17.6696 15.6519C17.6612 15.8239 17.5707 15.9815 17.4262 16.0756C17.2925 16.1626 17.0677 16.1626 16.618 16.1626Z"
      fill="white"
    />
  </svg>
));

AvalancheLogo.displayName = "AvalancheLogo";
