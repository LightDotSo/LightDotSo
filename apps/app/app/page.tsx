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

import { Connect } from "./connect";
import { EnsName, preload } from "@/components/EnsName";
import { invoker } from "@lightdotso/trpc";
import { getAuthSession } from "@lightdotso/next-auth";
import { User } from "./user";
import { SIWEButton } from "./siwe";
import { Suspense } from "react";
import { WalletSwitcher } from "@/components/WalletSwitcher";
import { UserNav } from "@/components/UserNav";
import { MainNav } from "@/components/MainNav";

export default async function Page() {
  const user = await invoker.user.me.query({});

  const session = await getAuthSession();

  preload(session?.user?.name as `0x${string}`);

  return (
    <main>
      <div className="hidden flex-col md:flex">
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <WalletSwitcher />
            <MainNav className="mx-6" />
            <div className="ml-auto flex items-center space-x-4">
              {/* <Search /> */}
              <UserNav />
              <Connect />
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <pre>{JSON.stringify(session, null, 2)}</pre>
          <EnsName params={{ address: session?.user?.name as `0x${string}` }} />
          <pre>{JSON.stringify(user, null, 2)}</pre>
          <Suspense>
            <User />
          </Suspense>
          <SIWEButton />
        </div>
      </div>
    </main>
  );
}

// export const runtime = "edge";
