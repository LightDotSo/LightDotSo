import { TokenImage } from "@lightdotso/elements";
import { useTokenAmounts } from "@lightdotso/hooks/src/useTokenAmounts";
import { useQueryTokenGroup } from "@lightdotso/query";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@lightdotso/ui";
import { getChainNameWithChainId, refineNumberFormat } from "@lightdotso/utils";
import { FC, ReactNode } from "react";

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
      {tokenGroup &&
        tokenGroup?.tokens &&
        tokenGroup?.tokens.length > 0 &&
        tokenAmounts &&
        tokenAmounts.length > 0 && (
          <HoverCardContent align="end" className="w-80 p-2 z-[2147483647]">
            <div className="flex justify-between">
              <div className="w-full">
                {tokenAmounts.map((token, index) => (
                  <div
                    key={index}
                    className="flex w-full items-center justify-between"
                  >
                    <div className="flex items-center gap-3 truncate py-2 text-xs font-medium text-text">
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
                    <div className="truncate text-xs text-text">
                      {token.amount &&
                        token.decimals &&
                        refineNumberFormat(
                          token.original_amount / Math.pow(10, token.decimals),
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
