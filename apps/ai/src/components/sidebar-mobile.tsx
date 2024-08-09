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

"use client";

import { IconSidebar } from "@/components/icons";
import { Sidebar } from "@/components/sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@lightdotso/ui";
import { Button } from "@lightdotso/ui";
import type { ReactNode } from "react";

interface SidebarMobileProps {
  children: ReactNode;
}

export function SidebarMobile({ children }: SidebarMobileProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="-ml-2 flex size-9 p-0 lg:hidden">
          <IconSidebar className="size-6" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="inset-y-0 flex h-auto w-[300px] flex-col p-0"
      >
        <Sidebar className="flex">{children}</Sidebar>
      </SheetContent>
    </Sheet>
  );
}
