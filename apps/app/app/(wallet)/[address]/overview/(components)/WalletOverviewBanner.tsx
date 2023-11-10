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

import { Avatar, Button } from "@lightdotso/ui";
import type { Address } from "viem";
import { splitAddress } from "@lightdotso/utils";
import { useCopy } from "@/hooks/useCopy";
import {
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { Send, Share } from "lucide-react";
import { useEnsName } from "wagmi";
import { PlaceholderOrb } from "@/components/placeholder-orb";

export function WalletOverviewBanner({ address }: { address: Address }) {
  const [isCopied, copy] = useCopy();
  const { data } = useEnsName({
    address: address,
  });

  return (
    <div className="lg:flex lg:items-center lg:justify-between">
      <div className="flex flex-row items-center space-x-5">
        <Avatar className="h-20 w-20">
          <PlaceholderOrb address={address ?? "0x"} />
        </Avatar>
        <div className="space-y-4 sm:mt-6 md:mt-0 md:space-y-6 md:pl-4">
          <div className="space-y-5 sm:mx-0 sm:max-w-xl sm:space-y-4">
            <h2 className="flex justify-start overflow-hidden text-ellipsis text-left text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">
              {data ?? (typeof address === "string" && splitAddress(address))}
            </h2>
            <div className="mx-auto flex flex-row justify-center space-x-3 sm:justify-start">
              <div className="flex rounded-md bg-muted px-3 py-1.5">
                <p className="mr-2 text-base text-muted-foreground">
                  {splitAddress(address)}
                </p>
                <button
                  onClick={() => {
                    return copy(address);
                  }}
                >
                  {!isCopied ? (
                    <ClipboardDocumentIcon className="h-6 w-6 text-muted-foreground" />
                  ) : (
                    <ClipboardDocumentCheckIcon className="h-6 w-6 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex flex-row items-center justify-start space-x-4">
              $300
            </div>
          </div>
        </div>
      </div>
      <div className="mt-10 flex items-center gap-x-4 lg:mt-0 lg:shrink-0">
        <Button className="mt-6 rounded-full p-3" variant="outline">
          <Share className="h-4 w-4" />
          <span className="sr-only">Open share modal</span>
        </Button>
        <Button className="mt-6 rounded-full p-3" variant="outline">
          <Send className="h-4 w-4" />
          <span className="sr-only">Open send modal</span>
        </Button>
        <Button type="button" className="mt-6" onClick={() => {}}>
          Deposit
        </Button>
      </div>
    </div>
  );
}
