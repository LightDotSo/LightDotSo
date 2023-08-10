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
import { useAction } from "@/trpc/client";
import { createPostAction } from "./_actions";

export function WithHook() {
  const action = useAction(createPostAction);

  return (
    <form
      className="space-y-2"
      onSubmit={async e => {
        e.preventDefault();
        await action.mutateAsync(new FormData(e.currentTarget));
        (e.target as HTMLFormElement).reset();
      }}
    >
      <Input type="text" name="title" placeholder="title" />
      <Input type="text" name="content" placeholder="content" />
      <Button type="submit">
        {action.status === "loading" && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-gray-900"></div>
        )}
        Create with useAction
      </Button>
    </form>
  );
}
