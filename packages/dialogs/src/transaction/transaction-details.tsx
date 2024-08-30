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

import { ExternalLink } from "@lightdotso/elements/external-link";
import { useUserOperationsProgress } from "@lightdotso/hooks";
import { ChainLogo } from "@lightdotso/svg";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@lightdotso/ui";
import {
  camelCaseToCapitalizedWords,
  getChainWithChainId,
  shortenAddress,
  shortenBytes32,
} from "@lightdotso/utils";
import type { FC } from "react";
import { isAddress } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export interface TransactionDetailInfoProps {
  title: string;
  value: string | number;
  href?: string;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TransactionDetailInfo: FC<TransactionDetailInfoProps> = ({
  title,
  value,
  href,
}) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="my-1 flex items-center justify-between">
      <div className="flex items-center">
        <div className="text-text-weak">{title}</div>
      </div>
      <div className="group flex items-center space-x-1.5 text-text">
        {href ? (
          <ExternalLink href={href} className="group-hover:underline">
            {value}
          </ExternalLink>
        ) : (
          <>{value}</>
        )}
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TransactionDetails: FC = () => {
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const { progressUserOperations } = useUserOperationsProgress();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      {progressUserOperations.map((progressUserOperation, index) => {
        const chain = getChainWithChainId(
          Number(progressUserOperation.chainId),
        );
        return (
          <Accordion
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            key={index}
            collapsible
            defaultValue="value-0"
            className="rounded-md border border-border bg-background-weak p-4"
            type="single"
          >
            <AccordionItem className="border-0" value={`value-${index}`}>
              <AccordionTrigger className="px-1 py-0 font-medium text-xl md:text-2xl">
                <div className="flex items-center">
                  <span className="mr-2.5">Transaction on {chain.name}</span>
                  <ChainLogo chainId={chain.id} />
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-1 pt-4">
                {Object.entries(progressUserOperation)
                  .filter(
                    ([key, value]) =>
                      typeof value !== "undefined" &&
                      key !== "initCode" &&
                      key !== "callData" &&
                      key !== "paymasterAndData" &&
                      key !== "signature",
                  )
                  .map(([key, value], itemIndex) => (
                    <TransactionDetailInfo
                      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                      key={`${index}-${itemIndex}`}
                      title={camelCaseToCapitalizedWords(key)}
                      value={
                        typeof value === "bigint"
                          ? value.toLocaleString()
                          : isAddress(value)
                            ? shortenAddress(value)
                            : shortenBytes32(value)
                      }
                    />
                  ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      })}
    </>
  );
};
