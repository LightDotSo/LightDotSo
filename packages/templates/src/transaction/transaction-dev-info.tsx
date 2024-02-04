// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { serialize } from "@lightdotso/wagmi";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export interface TransactionDevInfoProps {
  title: string;
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
        {data && (isNumber ? Number(data) : serialize(data, undefined, 2))}
      </code>
    </pre>
  );
};
