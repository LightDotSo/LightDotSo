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

import { MAINNET_CHAINS } from "@lightdotso/const";
import type { TokenData } from "@lightdotso/data";
import { TokenImage } from "@lightdotso/elements";
import { useQuerySocketBalances } from "@lightdotso/query";
import { useModals } from "@lightdotso/stores";
import { ChainLogo } from "@lightdotso/svg";
import { Modal } from "@lightdotso/templates";
import { cn, refineNumberFormat } from "@lightdotso/utils";
import { Button, ButtonIcon } from "@lightdotso/ui";
import { useMemo, useState } from "react";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function TokenModal() {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { balances } = useQuerySocketBalances({
    address: "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed",
  });

  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [chainId, setChainId] = useState<number>(0);

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { isTokenModalVisible, hideTokenModal } = useModals();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const tokens: TokenData[] = useMemo(() => {
    let filtered_balances = balances;

    if (balances && chainId > 0) {
      filtered_balances = balances.filter(
        balance => balance.chainId === chainId,
      );
    }

    // Map the balances to tokens
    if (filtered_balances) {
      return filtered_balances.map(balance => {
        return {
          id: `${balance.address}-${balance.chainId}`,
          chain_id: balance.chainId,
          balance_usd: 0,
          address: balance.address,
          amount: balance.amount,
          chainId: balance.chainId,
          decimals: balance.decimals,
          name: balance.name,
          symbol: balance.symbol,
        };
      });
    }

    return [];
  }, [balances, chainId]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (isTokenModalVisible) {
    return (
      <Modal
        open
        headerContent={
          <div className="flex flex-row space-x-2">
            <Button
              onClick={() => setChainId(0)}
              className={cn(chainId === 0 && "ring-2 ring-border-primary")}
              variant="shadow"
            >
              All Chains
            </Button>
            {MAINNET_CHAINS.map(chain => (
              <ButtonIcon
                onClick={() => setChainId(chain.id)}
                className={cn(
                  chainId === chain.id && "ring-2 ring-border-primary",
                )}
                key={chain.id}
                variant="shadow"
              >
                <ChainLogo chainId={chain.id} />
              </ButtonIcon>
            ))}
          </div>
        }
        onClose={hideTokenModal}
      >
        {tokens && tokens.length > 0 ? (
          <div className="">
            {tokens.map(token => (
              <div
                className="p-2 flex flex-row items-center hover:bg-background-stronger rounded-md cursor-pointer"
                key={token.address}
              >
                <TokenImage withChainLogo token={token} />
                <div className="pl-4 grow flex flex-col">
                  <div className="text-text">{token.name}</div>
                  <div className="font-light text-sm text-text-weak">
                    {token.symbol}
                  </div>
                </div>
                <div className="flex-none text-sm text-text-weak">
                  {refineNumberFormat(token.amount)}
                  {` ${token.symbol}`}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>No tokens found</div>
        )}
      </Modal>
    );
  }

  return null;
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export default TokenModal;
