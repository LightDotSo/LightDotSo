/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable @next/next/no-img-element */
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

// import { EnsName, preload } from "@/components/EnsName";
// import { invoker } from "@lightdotso/trpc";
// import { getAuthSession } from "@lightdotso/next-auth";
// import { User } from "./user";
// import { SIWEButton } from "./siwe";
// import { Suspense } from "react";

import { Dashboard } from "@/components/Dashboard";

export default async function Page() {
  // const user = await invoker.user.me.query({});

  // const session = await getAuthSession();

  // preload(session?.user?.name as `0x${string}`);

  return (
    <div>
      {/* We've used 3xl here, but feel free to try other max-widths based on your needs */}

      <Dashboard />
      {/* Content goes here */}
      {/* <pre>{JSON.stringify(session, null, 2)}</pre>
              <EnsName
                params={{ address: session?.user?.name as `0x${string}` }}
              />
              <pre>{JSON.stringify(user, null, 2)}</pre>
              <Suspense>
                <User />
              </Suspense>
              <SIWEButton /> */}
    </div>
  );
}

// export const runtime = "edge";
