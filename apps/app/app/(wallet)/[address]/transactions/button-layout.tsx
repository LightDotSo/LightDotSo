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

import { ButtonGroup, ButtonGroupItem } from "@lightdotso/ui";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

interface TransactionsButtonLayoutProps
  extends React.HTMLAttributes<HTMLElement> {
  items: {
    id: string;
    href: string;
    title: string;
  }[];
}

export function TransactionsButtonLayout({
  items,
}: TransactionsButtonLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Get the last part of the path
  // Ex) /wallets/0x1234567890abcdef/transactions -> transactions
  // Ex) /wallets/0x1234567890abcdef/transactions/queue -> queue

  const id = pathname.split("/").pop();

  // Get the wallet address from the path
  // Address is the first part of the path
  const address = pathname.split("/")[1];

  // Prefetch all the pages
  items.forEach(item => {
    router.prefetch(`/${address}${item.href}`);
  });

  return (
    <div className="flex w-full justify-end pt-8">
      <ButtonGroup defaultValue={id}>
        {items.map(item => (
          <ButtonGroupItem key={item.href} asChild value={item.id}>
            <Link key={item.id} href={`/${address}${item.href}`}>
              {item.title}
            </Link>
          </ButtonGroupItem>
        ))}
      </ButtonGroup>
    </div>
  );
}
