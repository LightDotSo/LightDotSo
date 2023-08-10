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

/**
 * This component invokes the procedure directly on the server,
 * without going through the HTTP endpoint.
 */
import { Button } from "@/components/button";
import { JsonPreTag } from "@/components/json-pretag";
import { api } from "@/trpc/server-invoker";

export async function ServerInvokedGreeting() {
  const greeting1 = await api.greeting.query({
    text: "i never hit an api endpoint",
  });
  const greeting2 = await api.greeting.query({
    text: "i also never hit an endpoint",
  });

  const secret = await api.secret.query();

  return (
    <div className="space-y-2">
      <JsonPreTag object={{ greeting1, greeting2, secret }} />
      <form
        action={async () => {
          "use server";
          await api.greeting.revalidate();
        }}
      >
        <Button type="submit">Revalidate Cache</Button>
      </form>
    </div>
  );
}
