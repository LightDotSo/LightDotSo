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
import { useQueryWalletSettings } from "@lightdotso/query";
import { swapFormSchema } from "@lightdotso/schemas";
import { useAuth, useModals } from "@lightdotso/stores";
import { Button, ButtonIcon, FormField, Input } from "@lightdotso/ui";
import { ArrowDown, ChevronDown, WalletIcon } from "lucide-react";
import { type FC } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Address } from "viem";

// -----------------------------------------------------------------------------
// Demo
// -----------------------------------------------------------------------------

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
// Types
// -----------------------------------------------------------------------------

type SwapFormValues = z.infer<typeof swapFormSchema>;

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export type SwapDialogProps = {
  className?: string;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const SwapDialog: FC<SwapDialogProps> = ({ className }) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { address } = useAuth();
  const { showTokenModal, setTokenModalProps, hideTokenModal } = useModals();
  const { walletSettings } = useQueryWalletSettings({
    address: address as Address,
  });

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  const form = useForm<SwapFormValues>({
    mode: "all",
    reValidateMode: "onBlur",
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className={className}>
      <div className="rounded-md border border-border-weaker bg-background-strong p-4 focus-within:ring-1 focus-within:ring-border-strong hover:border-border-weak">
        <span>Buy</span>
        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="buy.quantity"
            render={({ field }) => (
              <Input
                placeholder="0"
                className="h-16 truncate border-0 bg-background-strong p-0 text-4xl [appearance:textfield] focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                type="number"
                {...field}
              />
            )}
          />
          <Button
            onClick={() => {
              setTokenModalProps({
                address: address as Address,
                type: "native",
                isTestnet: walletSettings?.is_enabled_testnet ?? false,
                onClose: () => {
                  hideTokenModal();
                },
                onTokenSelect: token => {
                  form.setValue("buy.address", token.address);
                  form.setValue("buy.decimals", token.decimals);

                  form.trigger();

                  hideTokenModal();
                },
              });
              showTokenModal();
            }}
            variant="shadow"
            className="gap-x-2 px-2"
          >
            <TokenImage token={tokenGetData} />
            {tokenGetData.symbol}
            <ChevronDown className="size-10" />
          </Button>
        </div>
        <div className="flex w-full items-center justify-between">
          <span className="text-sm text-text-weak">$2,952.49 USD</span>
          <Button variant="shadow" size="xs" className="px-1 py-0">
            <WalletIcon className="size-4 text-text-weak" />
            <span className="pl-1 text-sm text-text-weak">Balance</span>
            <span className="pl-1 text-sm text-text">0.01</span>
          </Button>
        </div>
      </div>
      <div className="z-10 -my-4 flex items-center justify-center">
        <ButtonIcon onClick={showTokenModal} variant="shadow" size="sm">
          <ArrowDown />
        </ButtonIcon>
      </div>
      <div className="mt-1 rounded-md border border-border-weaker bg-background-strong p-4 focus-within:ring-1 focus-within:ring-border-strong hover:border-border-weak">
        <span>Sell</span>
        <div className="flex items-center justify-between">
          <Input
            placeholder="0"
            className="h-16 border-0 bg-background-strong p-0 text-4xl focus-visible:ring-0"
          />
          <Button variant="shadow" className="gap-x-2 px-2">
            <TokenImage token={tokenGetData} />
            {tokenGetData.symbol}
            <ChevronDown className="size-10" />
          </Button>
        </div>
        <div className="flex w-full items-center justify-between">
          <span className="text-sm text-text-weak">$2,952.49 USD</span>
          <Button variant="shadow" size="xs" className="px-1 py-0">
            <WalletIcon className="size-4 text-text-weak" />
            <span className="pl-1 text-sm text-text-weak">Balance</span>
            <span className="pl-1 text-sm text-text">0.01</span>
          </Button>
        </div>
      </div>
      <Button disabled size="lg" className="mt-1 w-full">
        Swap
      </Button>
    </div>
  );
};
