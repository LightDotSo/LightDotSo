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

import { ArrowUpRight } from "lucide-react";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export interface TransactionDetailInfoProps {
  title: string;
  value: string | number;
  href?: string;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TransactionDetailInfo: FC<TransactionDetailInfoProps> = ({
  title,
  value,
  href,
}) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="my-1 flex items-center justify-between">
      <div className="flex items-center">
        <div className="text-text-weak">{title}</div>
      </div>
      <div className="group flex items-center space-x-1.5 text-text">
        {href ? (
          <>
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="group-hover:underline"
            >
              {value}
            </a>
            <ArrowUpRight className="ml-2 size-4 shrink-0 opacity-50 group-hover:underline group-hover:opacity-100" />
          </>
        ) : (
          // eslint-disable-next-line react/jsx-no-useless-fragment
          <>{value}</>
        )}
      </div>
    </div>
  );
};
