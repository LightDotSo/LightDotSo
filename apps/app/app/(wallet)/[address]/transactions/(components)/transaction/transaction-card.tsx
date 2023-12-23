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
import Link from "next/link";
import type { FC } from "react";
import { useMemo } from "react";
import type { Address } from "viem";
import { TransactionCardExecuteButton } from "@/app/(wallet)/[address]/transactions/(components)/transaction/transaction-card-execute-button";
import { UserOperationTimeline } from "@/components/user-operation/user-operation-timeline";
import type { ConfigurationData, UserOperationData } from "@/data";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type TransactionCardProps = {
  address: Address;
  configuration: ConfigurationData;
  userOperation: UserOperationData;
  row: Row<UserOperationData>;
};

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

  const informationItems = useMemo(() => {
    const items = [
      { title: "Hash", value: shortenBytes32(userOperation.hash) },
      { title: "Nonce", value: userOperation.nonce },
      { title: "Status", value: userOperation.status.toLowerCase() },
      { title: "Signatures", value: userOperation.signatures.length },
    ];

    if (userOperation.transaction) {
      items.push({
        title: "Transaction",
        value: shortenBytes32(userOperation.transaction.hash),
      });
    }

    return items;
  }, [userOperation]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Collapsible key={userOperation.hash} asChild>
      <>
        <CollapsibleTrigger
          asChild
          className="cursor-pointer [&[data-state=open]>td>button>svg]:rotate-180"
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
              <Card className="col-span-1 space-y-4 border border-border-weak bg-background-stronger p-4">
                <CardHeader className="p-0">
                  <CardTitle className="text-lg">
                    Transaction Information
                  </CardTitle>
                  <CardDescription>
                    Get more information about this transaction.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {informationItems.map((item, index) => (
                    <div
                      key={index}
                      className="my-1 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-text-weak">{item.title}</div>
                      </div>
                      <div className="text-text">{item.value}</div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="flex w-full items-center justify-end p-0">
                  <Button asChild>
                    <Link
                      href={`/${userOperation.sender}/op/${userOperation.hash}`}
                    >
                      See More
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              <Card className="col-span-1 space-y-4 border border-border-weak bg-background-stronger p-4">
                <CardHeader className="p-0">
                  <CardTitle className="text-lg">Progress</CardTitle>
                  <CardDescription>
                    View the progress of this transaction.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="col-span-2 flex items-center">
                      <Progress
                        className="h-1"
                        value={
                          (userOperation.signatures.length /
                            configuration?.threshold!) *
                          100
                        }
                      />
                      <span className="ml-2">
                        {userOperation.signatures.length!}/
                        {configuration?.threshold!}
                      </span>
                    </div>
                    <div className="col-span-2 px-4 pt-4">
                      <UserOperationTimeline userOperation={userOperation} />
                    </div>
                  </div>
                </CardContent>
                {userOperation.status === "PROPOSED" && (
                  <CardFooter className="flex w-full items-center justify-end p-0">
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
