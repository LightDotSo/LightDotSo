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

import { JsonPreTag } from "@/components/json-pretag";
import { Suspense } from "react";
import { AuthThing, ClientGreeting } from "./ClientGreeting";

export default function Home() {
  return (
    <div className="space-y-4">
      <div className="prose">
        <h2>React Query Stream Mode</h2>
        <p>
          The below queries are fetched on the server in client components
          during SSR, then streamed to the client as they resolve. This has the
          benefit that you can continue to use React Query just as you&apos;re
          used to, but with the benefits of streaming with {`<Suspense>`}.
        </p>
      </div>

      <Suspense>
        <AuthThing />
      </Suspense>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">
          HTTP request from server component
        </h3>
        <p>
          You can use our new <code>{`experiemental_nextHttpLink`}</code> to
          call your procedures over HTTP, just like you normally would in the
          old model. We&apos;ll automatically handle the cache tags for you.
          Fetching over HTTP can be useful if you have multiple clients and
          still need the API exposed, or you may want to render your components
          on an edge runtime, but your server functions requires Node
          primitives.
        </p>
        <Suspense
          fallback={
            <JsonPreTag object={{ loading: true, requester: "http react" }} />
          }
        >
          <ClientGreeting />
        </Suspense>
      </div>
    </div>
  );
}
