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

"use client";

import { useNewFormStore } from "@/stores/useNewForm";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const RootContext: FC = () => {
  const { address, errors, formValues, isValid, isLoading } = useNewFormStore();

  return (
    <div>
      <pre className="mt-2 w-full overflow-auto rounded-md p-4">
        <code className="break-all text-text">
          {isLoading ? "IsLoading" : "Loaded"}
          <br></br>
          {isValid ? "Valid" : "Invalid"}
          <br></br>
          {JSON.stringify(address, null, 2)}
          <br></br>
          {JSON.stringify(errors, null, 2)}
          <br></br>
          {JSON.stringify(formValues, null, 2)}
        </code>
      </pre>
    </div>
  );
};
