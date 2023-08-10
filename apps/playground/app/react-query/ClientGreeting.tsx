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
import { JsonPreTag } from "@/components/json-pretag";
import { api } from "@lightdotso/trpc";

export function AuthThing() {
  const [me] = api.me.useSuspenseQuery();

  return (
    <div>
      <h3 className="text-lg font-semibold">Session</h3>
      <p>
        This session comes from a tRPC query. No context provider is necessary
        to authenticate your users on the server.
      </p>
      <JsonPreTag object={me} />
    </div>
  );
}

export function ClientGreeting() {
  const [greeting1] = api.greeting.useSuspenseQuery({ text: "from react1" });
  const [greeting2] = api.greeting.useSuspenseQuery({ text: "from react2" });
  const [secret] = api.secret.useSuspenseQuery();

  const trpcContext = api.useContext();

  return (
    <div className="space-y-2">
      <JsonPreTag object={{ greeting1, greeting2, secret }} />
      <Button onClick={() => trpcContext.greeting.invalidate()}>
        Revalidate HTTP
      </Button>
    </div>
  );
}
