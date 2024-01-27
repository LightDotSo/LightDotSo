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

import type { ConfigurationData, UserOperationData } from "@lightdotso/data";
import { UserOperationTimeline } from "@lightdotso/elements";
import { useCopy } from "@lightdotso/hooks";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Progress,
  toast,
} from "@lightdotso/ui";
import { cn, getChainById, shortenBytes32 } from "@lightdotso/utils";
import type { Row } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { ArrowUpRight, ShareIcon } from "lucide-react";
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
  configuration: ConfigurationData;
  userOperation: UserOperationData;
  row: Row<UserOperationData>;
  opType?: boolean;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const UserOperationCardTransaction: FC<
  UserOperationCardTransactionProps
> = ({ address, configuration, userOperation, row, opType = false }) => {
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const [, copy] = useCopy();

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

    toast.success("Copied to clipboard");
  }, [copy, userOperation.hash, userOperation.sender]);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  const chain = useMemo(
    () => getChainById(userOperation.chain_id),
    [userOperation],
  );

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const informationItems = useMemo(() => {
    const items: TransactionInformationItem[] = [
      { title: "Hash", value: shortenBytes32(userOperation.hash) },
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
        href: `${chain?.blockExplorers?.default?.url}/tx/${userOperation.transaction.hash}`,
      });
    }

    return items;
  }, [
    chain?.blockExplorers?.default?.url,
    chain?.name,
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
    <Collapsible key={userOperation.hash} asChild defaultOpen={opType}>
      <>
        <CollapsibleTrigger
          asChild
          className="cursor-pointer [&[data-state=open]>div>div>button>svg]:rotate-180"
          type={undefined}
        >
          <div className="transaction group flex w-full items-center border-b border-b-border p-3 transition-colors last:border-b-0 hover:bg-background-stronger/50">
            {row.getVisibleCells().map(cell => (
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
                      key={index}
                      className="my-1 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="text-text-weak">{item.title}</div>
                      </div>
                      <div className="group flex items-center space-x-1.5 text-text">
                        {item.href ? (
                          <>
                            <a
                              href={item.href}
                              target="_blank"
                              rel="noreferrer"
                              className="group-hover:underline"
                            >
                              {item.value}
                            </a>
                            <ArrowUpRight className="ml-2 size-4 shrink-0 opacity-50 group-hover:underline group-hover:opacity-100" />
                          </>
                        ) : (
                          // eslint-disable-next-line react/jsx-no-useless-fragment
                          <>{item.value}</>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  {!opType ? (
                    <Button
                      asChild
                      variant="ghost"
                      className="w-full bg-background-stronger"
                    >
                      <Link
                        href={`/${userOperation.sender}/op/${userOperation.hash}`}
                      >
                        See Details
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      className="w-full bg-background-stronger"
                      onClick={handleLinkCopy}
                    >
                      <ShareIcon className="mr-2 size-3" />
                      Share Link
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
                            // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                            configuration?.threshold!) *
                          100
                        }
                      />
                      <span className="ml-2">
                        {/* eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain */}
                        {userOperation.signatures.length!}/
                        {/* eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain */}
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
                      config={configuration}
                      userOperation={userOperation}
                    />
                  )}
                  <UserOperationCardTransactionExecuteButton
                    address={address}
                    config={configuration}
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
