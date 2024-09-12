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

import type { ConfigurationData, UserOperationData } from "@lightdotso/data";
import { ExternalLink } from "@lightdotso/elements/external-link";
import { UserOperationTimeline } from "@lightdotso/elements/user-operation-timeline";
import { useCopy, useIsDemoPathname } from "@lightdotso/hooks";
import { Button } from "@lightdotso/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@lightdotso/ui/components/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@lightdotso/ui/components/collapsible";
import { Progress } from "@lightdotso/ui/components/progress";
import { toast } from "@lightdotso/ui/components/toast";
import {
  cn,
  getChainWithChainId,
  getEtherscanUrl,
  shortenBytes32,
} from "@lightdotso/utils";
import type { Row } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { CopyCheckIcon, ShareIcon } from "lucide-react";
import Link from "next/link";
import type { FC } from "react";
import { Fragment, useCallback, useMemo } from "react";
import type { Address } from "viem";
import { UserOperationCardTransactionExecuteButton } from "./user-operation-card-transaction-execute-button";
import { UserOperationCardTransactionSignButton } from "./user-operation-card-transaction-sign-button";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface TransactionInformationItem {
  title: string;
  value: string | number;
  href?: string;
}

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type UserOperationCardTransactionProps = {
  address: Address;
  isTestnet: boolean;
  configuration: ConfigurationData;
  userOperation: UserOperationData;
  row: Row<UserOperationData>;
  isDefaultOpen?: boolean;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const UserOperationCardTransaction: FC<
  UserOperationCardTransactionProps
> = ({ address, configuration, userOperation, row, isDefaultOpen = false }) => {
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const [isCopying, copy] = useCopy();
  const isDemo = useIsDemoPathname();

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  const handleLinkCopy = useCallback(() => {
    // Get the current URL
    const url = new URL(window.location.href);
    // Set the pathname to the current user operation
    url.pathname = `/${userOperation.sender}/op/${userOperation.hash}`;
    // Copy the URL to the clipboard
    copy(url.toString());

    toast.success("Copied to clipboard!");
  }, [copy, userOperation.hash, userOperation.sender]);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  const chain = useMemo(
    () => getChainWithChainId(userOperation.chain_id),
    [userOperation],
  );

  const informationItems = useMemo(() => {
    const items: TransactionInformationItem[] = [
      {
        title: "Hash",
        value: shortenBytes32(userOperation.hash),
        href: `https://jiffyscan.xyz/userOpHash/${userOperation.hash}`,
      },
      { title: "Nonce", value: userOperation.nonce },
      {
        title: "Status",
        value:
          userOperation.status.charAt(0) +
          userOperation.status.slice(1).toLowerCase(),
      },
      { title: "Signatures", value: userOperation.signatures.length },
      { title: "Threshold", value: configuration?.threshold },
      {
        title: "Created At",
        value: new Date(userOperation.created_at).toLocaleString(),
      },
      {
        title: "Updated At",
        value: new Date(userOperation.updated_at).toLocaleString(),
      },
      { title: "Chain", value: chain?.name },
    ];

    if (userOperation.transaction) {
      items.push({
        title: "Transaction Hash",
        value: shortenBytes32(userOperation.transaction.hash),
        href: `${getEtherscanUrl(chain)}/tx/${userOperation.transaction.hash}`,
      });
    }

    return items;
  }, [
    chain,
    configuration?.threshold,
    userOperation.created_at,
    userOperation.hash,
    userOperation.nonce,
    userOperation.signatures.length,
    userOperation.status,
    userOperation.transaction,
    userOperation.updated_at,
  ]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Collapsible
      key={userOperation.hash}
      asChild
      defaultOpen={isDefaultOpen}
      disabled={isDefaultOpen}
    >
      <>
        <CollapsibleTrigger
          asChild
          className="cursor-pointer [&[data-state=open]>div>div>button>svg]:rotate-180"
          type={undefined}
        >
          <div className="transaction group flex w-full items-center border-b border-b-border p-3 transition-colors last:border-b-0 hover:bg-background-stronger/50">
            {row.getVisibleCells().map((cell) => (
              <Fragment key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Fragment>
            ))}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent asChild>
          <div className="border-b border-b-border p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1 flex h-full flex-col justify-between space-y-4 border border-border-weak bg-background-strong p-4">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Transaction Information
                  </CardTitle>
                  <CardDescription>
                    Get more information about this transaction.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grow">
                  {informationItems.map((item, index) => (
                    <div
                      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                      key={index}
                      className="my-1 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="text-text-weak">{item.title}</div>
                      </div>
                      <div className="group flex items-center space-x-1.5 text-text">
                        {item.href ? (
                          <ExternalLink
                            href={item.href}
                            className="text-text hover:text-text-strong group-hover:underline"
                          >
                            {item.value}
                          </ExternalLink>
                        ) : (
                          <>{item.value}</>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  {isDefaultOpen ? (
                    <Button
                      variant="ghost"
                      className="w-full bg-background-stronger"
                      onClick={handleLinkCopy}
                    >
                      {isCopying ? (
                        <CopyCheckIcon className="mr-2 size-3" />
                      ) : (
                        <ShareIcon className="mr-2 size-3" />
                      )}
                      Share Link
                    </Button>
                  ) : (
                    <Button
                      asChild
                      variant="ghost"
                      className="w-full bg-background-stronger"
                    >
                      <Link
                        href={`/${isDemo ? "demo" : userOperation.sender}/op/${userOperation.hash}`}
                      >
                        See Details
                      </Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
              <Card className="col-span-1 flex flex-col justify-between space-y-4 border border-border-weak bg-background-strong p-4">
                <CardHeader>
                  <CardTitle className="text-lg">Progress</CardTitle>
                  <CardDescription>
                    View the progress of this transaction.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grow">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="col-span-2 flex items-center">
                      <Progress
                        className="h-1"
                        value={
                          (userOperation.signatures.length /
                            // biome-ignore lint/style/noNonNullAssertion: <explanation>
                            configuration?.threshold!) *
                          100
                        }
                      />
                      <span className="ml-2">
                        {/* biome-ignore lint/style/noNonNullAssertion: <explanation> */}
                        {userOperation.signatures.length!}/
                        {/* biome-ignore lint/style/noNonNullAssertion: <explanation> */}
                        {configuration?.threshold!}
                      </span>
                    </div>
                    <div className="col-span-2 px-4 pt-4">
                      <UserOperationTimeline
                        size="xs"
                        userOperation={userOperation}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter
                  className={cn(
                    "grid w-full items-center gap-3",
                    userOperation.status === "PROPOSED"
                      ? "grid-cols-2"
                      : "grid-cols-1",
                  )}
                >
                  {userOperation.status === "PROPOSED" && (
                    <UserOperationCardTransactionSignButton
                      address={address}
                      configuration={configuration}
                      userOperation={userOperation}
                    />
                  )}
                  <UserOperationCardTransactionExecuteButton
                    address={address}
                    userOperation={userOperation}
                  />
                </CardFooter>
              </Card>
            </div>
          </div>
        </CollapsibleContent>
      </>
    </Collapsible>
  );
};
