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
import { steps } from "./root";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type ChangeEvent, useEffect, useCallback } from "react";

export function NewWallet() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nameParam = searchParams.get("name");

  const [name, setName] = useState(nameParam || "");

  // Function to handle input change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  // React to the changes
  useEffect(() => {
    const url = new URL(window.location.href);
    if (name === "") {
      url.searchParams.delete("name");
      router.replace(url.toString());
      return;
    }
    url.searchParams.set("name", name);
    router.replace(url.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const navigateToStep = useCallback(() => {
    const url = new URL(steps[1].href, window.location.origin);
    url.searchParams.set("name", name || "");
    router.push(url.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  return (
    <Card className="flex flex-col space-y-6 px-2 py-4 lg:px-6 lg:pb-6 lg:pt-10">
      <CardHeader className="gap-3">
        <CardTitle>Create a New Wallet</CardTitle>
        <CardDescription>Select a name for your new wallet.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-10">
        <div className="grid gap-3">
          <Label htmlFor="name">Name</Label>
          <Input
            onChange={handleInputChange}
            id="name"
            placeholder="Your Wallet Name"
            value={name}
          />
          <CardDescription className="text-sm">
            By creating a new wallet, you are accepting our term and conditions
          </CardDescription>
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button
          disabled={!nameParam}
          variant={nameParam ? "default" : "ghost"}
          onClick={() => navigateToStep()}
          className="w-32"
        >
          Continue
        </Button>
      </CardFooter>
    </Card>
  );
}
