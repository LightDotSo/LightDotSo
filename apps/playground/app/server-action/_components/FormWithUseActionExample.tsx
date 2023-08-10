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
import { JsonPreTag } from "@/components/json-pretag";
import { useAction } from "@lightdotso/trpc";
import { testAction } from "../_actions";

export function FormWithUseActionExample() {
  const mutation = useAction(testAction);
  return (
    <div className="space-y-2">
      <p>Check the console for the logger output.</p>
      <form
        action={testAction}
        onSubmit={e => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          mutation.mutate(formData);
        }}
        className="space-y-2"
      >
        <Input type="text" name="text" />
        <Button type="submit">Run server action raw debugging</Button>

        <JsonPreTag object={mutation} />
      </form>
    </div>
  );
}
