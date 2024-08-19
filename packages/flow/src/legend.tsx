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

import { DiamondIcon, Fingerprint, Hash, Key } from "lucide-react";

export const SchemaGraphLegend = () => {
  return (
    <div className="flex h-10 justify-center border-t bg-muted/50 px-3 text-muted-foreground text-xs shadow-md md:text-[0.625rem]">
      <ul className="flex flex-wrap items-center justify-center gap-4">
        <li className="flex items-center gap-1 font-mono">
          <Key
            size={15}
            strokeWidth={1.5}
            className="flex-shrink-0 text-light"
          />
          Primary key
        </li>
        <li className="flex items-center gap-1 font-mono">
          <Hash
            size={15}
            strokeWidth={1.5}
            className="flex-shrink-0 text-light"
          />
          Identity
        </li>
        <li className="flex items-center gap-1 font-mono">
          <Fingerprint
            size={15}
            strokeWidth={1.5}
            className="flex-shrink-0 text-light"
          />
          Unique
        </li>
        <li className="flex items-center gap-1 font-mono">
          <DiamondIcon
            size={15}
            strokeWidth={1.5}
            className="flex-shrink-0 text-light"
          />
          Nullable
        </li>
        <li className="flex items-center gap-1 font-mono">
          <DiamondIcon
            size={15}
            strokeWidth={1.5}
            fill="currentColor"
            className="flex-shrink-0 text-light"
          />
          Non-Nullable
        </li>
      </ul>
    </div>
  );
};
