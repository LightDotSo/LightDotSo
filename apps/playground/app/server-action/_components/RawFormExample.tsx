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

import { Button } from "@lightdotso/ui";
import { Input } from "@/components/input";
import { testAction } from "../_actions";

export function RawFormExample() {
  return (
    <div className="space-y-2">
      <p>
        Check the network tab and the server console to see that we called this.
        If you don not pass an input, it will fail validation and not reach the
        procedure.
      </p>
      <form action={testAction} className="space-y-2">
        <Input type="text" name="text" />
        <Button type="submit">Run server action raw debugging</Button>
      </form>
    </div>
  );
}
