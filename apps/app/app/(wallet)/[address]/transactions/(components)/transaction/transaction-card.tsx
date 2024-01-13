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
  TableCell,
  TableRow,
} from "@lightdotso/ui";
import { shortenBytes32 } from "@lightdotso/utils";
import type { Row } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { FC } from "react";
import { useMemo } from "react";
import type { Address } from "viem";
import { TransactionCardExecuteButton } from "@/app/(wallet)/[address]/transactions/(components)/transaction/transaction-card-execute-button";
import { TransactionCardSignButton } from "@/app/(wallet)/[address]/transactions/(components)/transaction/transaction-card-sign-button";
import { UserOperationTimeline } from "@/components/user-operation/user-operation-timeline";
import type { ConfigurationData, UserOperationData } from "@lightdotso/data";
import { getChainById } from "@/utils";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type TransactionCardProps = {
  address: Address;
  configuration: ConfigurationData;
  userOperation: UserOperationData;
  row: Row<UserOperationData>;
};

interface TransactionInformationItem {
  title: string;
  value: string | number;
  href?: string;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TransactionCard: FC<TransactionCardProps> = ({
  address,
  configuration,
  userOperation,
  row,
}) => {
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
    <Collapsible key={userOperation.hash} asChild>
      <>
        <CollapsibleTrigger
          asChild
          className="cursor-pointer [&[data-state=open]>td>div>button>svg]:rotate-180"
          type={undefined}
        >
          <TableRow>
            {row.getVisibleCells().map(cell => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        </CollapsibleTrigger>
        <CollapsibleContent asChild>
          <TableCell className="p-0" colSpan={row.getAllCells().length}>
            <div className="m-4 grid gap-4 md:grid-cols-2">
              <Card className="col-span-1 flex h-full flex-col justify-between space-y-4 border border-border-weak bg-background-strong p-4">
                <CardHeader className="p-0">
                  <CardTitle className="text-lg">
                    Transaction Information
                  </CardTitle>
                  <CardDescription>
                    Get more information about this transaction.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grow p-0">
                  {informationItems.map((item, index) => (
                    <div
                      key={index}
                      className="my-1 flex items-center justify-between"
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
                            <ArrowUpRight className="ml-2 h-4 w-4 shrink-0 opacity-50 group-hover:underline group-hover:opacity-100" />
                          </>
                        ) : (
                          // eslint-disable-next-line react/jsx-no-useless-fragment
                          <>{item.value}</>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="p-0">
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
                </CardFooter>
              </Card>
              <Card className="col-span-1 flex flex-col justify-between space-y-4 border border-border-weak bg-background-strong p-4">
                <CardHeader className="p-0">
                  <CardTitle className="text-lg">Progress</CardTitle>
                  <CardDescription>
                    View the progress of this transaction.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grow p-0">
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
                {userOperation.status === "PROPOSED" && (
                  <CardFooter className="grid w-full grid-cols-2 items-center gap-3 p-0">
                    <TransactionCardSignButton
                      address={address}
                      config={configuration}
                      userOperation={userOperation}
                    />
                    <TransactionCardExecuteButton
                      address={address}
                      config={configuration}
                      userOperation={userOperation}
                    />
                  </CardFooter>
                )}
              </Card>
            </div>
          </TableCell>
        </CollapsibleContent>
      </>
    </Collapsible>
  );
};
