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

import { TokenImage } from "@lightdotso/elements";
import { Button, ButtonIcon, Input } from "@lightdotso/ui";
import { ArrowDown, ChevronDown, WalletIcon } from "lucide-react";
import { type FC } from "react";

const tokenGetData = {
  id: "clota6rxh0000l308gsist1ix",
  address: "0x0000000000000000000000000000000000000000",
  chain_id: 10,
  name: "Ether",
  symbol: "ETH",
  decimals: 18,
  amount: 1000000000000000,
  balance_usd: 2.6155005,
  group: null,
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Swap: FC = () => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="max-w-md">
      <div className="bg-background-strong border border-border-weaker hover:border-border-weak focus-within:ring-1 focus-within:ring-border-strong p-4 rounded-md">
        <span>Buy</span>
        <div className="flex items-center justify-between">
          <Input
            placeholder="0"
            className="p-0 h-16 text-4xl border-0 focus-visible:ring-0 bg-background-strong"
          />
          <Button variant="shadow" className="px-2 gap-x-2">
            <TokenImage token={tokenGetData} />
            {tokenGetData.symbol}
            <ChevronDown className="size-10" />
          </Button>
        </div>
        <div className="flex w-full items-center justify-between">
          <span className="text-sm text-text-weak">$2,952.49 USD</span>
          <Button variant="shadow" size="xs" className="px-1 py-0">
            <WalletIcon className="text-text-weak size-4" />
            <span className="pl-1 text-sm text-text-weak">Balance</span>
            <span className="pl-1 text-sm text-text">0.01</span>
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-center -my-4 z-10">
        <ButtonIcon variant="shadow" size="sm">
          <ArrowDown />
        </ButtonIcon>
      </div>
      <div className="mt-1 bg-background-strong border border-border-weaker hover:border-border-weak focus-within:ring-1 focus-within:ring-border-strong p-4 rounded-md">
        <span>Sell</span>
        <div className="flex items-center justify-between">
          <Input
            placeholder="0"
            className="p-0 h-16 text-4xl border-0 focus-visible:ring-0 bg-background-strong"
          />
          <Button variant="shadow" className="px-2 gap-x-2">
            <TokenImage token={tokenGetData} />
            {tokenGetData.symbol}
            <ChevronDown className="size-10" />
          </Button>
        </div>
        <div className="flex w-full items-center justify-between">
          <span className="text-sm text-text-weak">$2,952.49 USD</span>
          <Button variant="shadow" size="xs" className="px-1 py-0">
            <WalletIcon className="text-text-weak size-4" />
            <span className="pl-1 text-sm text-text-weak">Balance</span>
            <span className="pl-1 text-sm text-text">0.01</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
