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

type TokenIconProps = SVGProps<SVGSVGElement>;

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TokenIcon: FC<TokenIconProps> = ({ className, ...props }) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      {...props}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Token Icon</title>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.2933 15.5355L8.46492 12.7071C8.0744 12.3166 8.0744 11.6834 8.46492 11.2929L11.2933 8.46447C11.6839 8.07394 12.317 8.07394 12.7076 8.46447L15.536 11.2929C15.9265 11.6834 15.9265 12.3166 15.536 12.7071L12.7076 15.5355C12.317 15.9261 11.6839 15.9261 11.2933 15.5355ZM12.0005 13.4142L10.5862 12L12.0005 10.5858L13.4147 12L12.0005 13.4142Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12ZM19 12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12C5 8.13401 8.13401 5 12 5C15.866 5 19 8.13401 19 12Z"
      />
    </svg>
  );
};
