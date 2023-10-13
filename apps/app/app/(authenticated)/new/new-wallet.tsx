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
  Input,
  Label,
} from "@lightdotso/ui";

export function NewWallet() {
  return (
    <Card className="flex flex-col space-y-6 px-2 py-4 lg:px-8 lg:py-6">
      <CardHeader className="gap-4">
        <CardTitle>Create a New Wallet</CardTitle>
        <CardDescription>Select a name for your new wallet.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-10">
        <div className="grid gap-3">
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="Your Wallet Name" />
          <CardDescription className="text-sm">
            By creating a new wallet, you are accepting our term and conditions
          </CardDescription>
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button className="w-32">Continue</Button>
      </CardFooter>
    </Card>
  );
}
