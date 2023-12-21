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
import type { Row } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import Link from "next/link";
import type { FC } from "react";
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
            <div className="my-4 grid gap-4 md:grid-cols-3">
              <Card className="col-span-1 bg-background-stronger">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Transaction Information
                  </CardTitle>
                  <CardDescription>
                    Get more information about this transaction.
                  </CardDescription>
                </CardHeader>
                <CardContent />
                <CardFooter className="flex w-full items-center justify-end">
                  <Button asChild>
                    <Link
                      href={`/${userOperation.sender}/op/${userOperation.hash}`}
                    >
                      See More
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              <Card className="col-span-2 bg-background-stronger">
                <CardHeader>
                  <CardTitle className="text-lg">Progress</CardTitle>
                  <CardDescription>
                    View the progress of this transaction.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Progress
                      className="col-span-1"
                      value={
                        (userOperation.signatures.length /
                          configuration?.threshold!) *
                        100
                      }
                    />
                    <div className="col-span-1">
                      Threshold: {configuration?.threshold!}/
                      {configuration?.owners?.length!}
                    </div>
                    <div className="col-span-2 px-4">
                      <UserOperationTimeline userOperation={userOperation} />
                    </div>
                  </div>
                </CardContent>
                {userOperation.status === "PROPOSED" && (
                  <CardFooter className="flex w-full items-center justify-end">
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
