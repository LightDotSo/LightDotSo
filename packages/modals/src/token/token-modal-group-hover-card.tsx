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

import { TokenImage } from "@lightdotso/elements/token-image";
import { useTokenAmounts } from "@lightdotso/hooks";
import { useQueryTokenGroup } from "@lightdotso/query";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@lightdotso/ui/components/hover-card";
import { getChainNameWithChainId, refineNumberFormat } from "@lightdotso/utils";
import type { FC, ReactNode } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type TokenModalGroupHoverCardProps = {
  children: ReactNode;
  groupId?: string;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TokenModalGroupHoverCard: FC<TokenModalGroupHoverCardProps> = ({
  children,
  groupId,
}) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { tokenGroup } = useQueryTokenGroup({
    id: groupId,
  });

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const { tokenAmounts } = useTokenAmounts({
    group_id: groupId,
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!groupId) {
    return <>{children}</>;
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      {tokenGroup?.tokens &&
        tokenGroup?.tokens.length > 0 &&
        tokenAmounts &&
        tokenAmounts.length > 0 && (
          <HoverCardContent
            align="end"
            side="bottom"
            className="z-[2147483647] w-60 bg-background p-2"
          >
            <div className="flex justify-between">
              <div className="w-full">
                {tokenAmounts.map((token, index) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                    key={index}
                    className="flex w-full items-center justify-between"
                  >
                    <div className="flex items-center gap-3 truncate p-2 font-medium text-text text-xs">
                      <TokenImage
                        size="xs"
                        withChainLogo
                        token={{
                          ...token,
                          amount: Number(token.amount),
                          group: undefined,
                        }}
                      />
                      {getChainNameWithChainId(token.chain_id)}
                    </div>
                    <div className="truncate text-text text-xs">
                      {token.amount &&
                        token.decimals &&
                        refineNumberFormat(
                          token.original_amount / 10 ** token.decimals,
                        )}{" "}
                      {token.symbol}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </HoverCardContent>
        )}
    </HoverCard>
  );
};
