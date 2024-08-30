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

import { serialize } from "@lightdotso/wagmi/wagmi";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export interface TransactionDevInfoProps {
  title: string;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  data: any;
  isNumber?: boolean;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TransactionDevInfo: FC<TransactionDevInfoProps> = ({
  title,
  data,
  isNumber,
}) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <pre className="grid grid-cols-4 items-center gap-4 overflow-auto">
      <code className="break-all text-text">
        {title}:{" "}
        {typeof data === "boolean"
          ? data
            ? "true"
            : "false"
          : data && (isNumber ? Number(data) : serialize(data, undefined, 2))}
      </code>
    </pre>
  );
};
