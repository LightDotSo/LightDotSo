// Copyright 2023-2024 LightDotSo.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// import { auth } from "@/auth";
import { IconGitHub, IconSeparator, IconVercel } from "@/components/icons";
import { buttonVariants } from "@lightdotso/ui";
import { cn } from "@lightdotso/utils";
import { Suspense } from "react";

// -----------------------------------------------------------------------------
// Action
// -----------------------------------------------------------------------------

// biome-ignore lint/suspicious/useAwait: <explanation>
async function UserOrLogin() {
  // const session = (await auth()) as Session;
  return (
    <>
      {/* {session?.user ? (
        <>
          <SidebarMobile>
            <ChatHistory userId={session.user.id} />
          </SidebarMobile>
          <SidebarToggle />
        </>
      ) : (
        <Link href="/new" rel="nofollow">
          <IconNextChat className="mr-2 size-6 dark:hidden" inverted />
          <IconNextChat className="mr-2 hidden size-6 dark:block" />
        </Link>
      )} */}
      <div className="flex items-center">
        <IconSeparator className="size-6 text-text-weak/50" />
        {/* {session?.user ? (
          <UserMenu user={session.user} />
        ) : (
          <Button variant="link" asChild className="-ml-2">
            <Link href="/login">Login</Link>
          </Button>
        )} */}
      </div>
    </>
  );
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b bg-gradient-to-b from-background/10 via-background/50 to-background/80 px-4 backdrop-blur-xl">
      <div className="flex items-center">
        <Suspense fallback={<div className="flex-1 overflow-auto" />}>
          <UserOrLogin />
        </Suspense>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <a
          target="_blank"
          href="https://github.com/vercel/nextjs-ai-chatbot/"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          <IconGitHub />
          <span className="ml-2 hidden md:flex">GitHub</span>
        </a>
        <a
          href="https://vercel.com/templates/Next.js/nextjs-ai-chatbot"
          target="_blank"
          className={cn(buttonVariants())}
          rel="noreferrer"
        >
          <IconVercel className="mr-2" />
          <span className="hidden sm:block">Deploy to Vercel</span>
          <span className="sm:hidden">Deploy</span>
        </a>
      </div>
    </header>
  );
}
