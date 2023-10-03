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

import { Connect } from "./connect";
// import { EnsName, preload } from "@/components/EnsName";
// import { invoker } from "@lightdotso/trpc";
// import { getAuthSession } from "@lightdotso/next-auth";
// import { User } from "./user";
// import { SIWEButton } from "./siwe";
// import { Suspense } from "react";
import { WalletSwitcher } from "@/components/WalletSwitcher";
import { Logo } from "@/components/Logo";
import { UserNav } from "@/components/UserNav";
import { MainNav } from "@/components/MainNav";
import { FeedbackPopover } from "@/components/FeedbackPopover";
import Link from "next/link";
import { Dashboard } from "@/components/Dashboard";

export default async function Page() {
  // const user = await invoker.user.me.query({});

  // const session = await getAuthSession();

  // preload(session?.user?.name as `0x${string}`);

  return (
    <main>
      <div className="hidden flex-col md:flex">
        <div className="border-b py-2">
          <div className="flex h-16 items-center px-10">
            <div className="flex items-center">
              <Link href="/" className="hover:rounded-md hover:bg-accent">
                <Logo className="m-2.5 h-8 w-auto fill-slate-600 dark:fill-slate-300" />
              </Link>
              <span className="ml-2 mr-1 text-primary/60">/</span>
              <WalletSwitcher />
            </div>
            <div className="ml-auto flex items-center space-x-4">
              {/* <Search /> */}
              <FeedbackPopover />
              <UserNav />
              <Connect />
            </div>
          </div>
          <MainNav className="h-10 items-center px-12" />
        </div>
        <div className="flex-1 space-y-4 p-8 pt-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* We've used 3xl here, but feel free to try other max-widths based on your needs */}
            <div className="mx-auto max-w-4xl">
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
          </div>
        </div>
      </div>
    </main>
  );
}

// export const runtime = "edge";
