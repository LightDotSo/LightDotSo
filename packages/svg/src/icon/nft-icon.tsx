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

import type { FC, SVGProps } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type NftIconProps = SVGProps<SVGSVGElement>;

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const NftIcon: FC<NftIconProps> = ({ className, ...props }) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <title>NFT Icon</title>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 4H18V20H6V4ZM4 4C4 2.89543 4.89543 2 6 2H18C19.1046 2 20 2.89543 20 4V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4ZM9.6 9H14.4L16 11.2222L12 15.6667L8 11.2222L9.6 9Z"
      />
    </svg>
  );
};
