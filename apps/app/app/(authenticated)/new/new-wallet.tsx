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
  RadioGroup,
  RadioGroupItem,
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
  const typeParam = searchParams.get("type");

  const [name, setName] = useState(nameParam || "");
  const [type, setType] = useState(typeParam || "card");

  // Function to handle input change
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  // Function to handle input change
  const handleTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setType(e.target.value);
  };

  // React to the name changes
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

  // React to the type changes
  useEffect(() => {
    const url = new URL(window.location.href);
    if (type === "card") {
      url.searchParams.delete("type");
      router.replace(url.toString());
      return;
    }
    url.searchParams.set("type", type);
    router.replace(url.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const navigateToStep = useCallback(() => {
    const url = new URL(steps[1].href, window.location.origin);
    url.searchParams.set("name", name || "");
    router.push(url.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  return (
    <Card className="flex flex-col space-y-6 px-2 py-4 lg:px-6 lg:pb-6 lg:pt-8">
      <CardHeader className="gap-3">
        <CardTitle>Create a New Wallet</CardTitle>
        <CardDescription>Select a name for your new wallet.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-10">
        <div className="grid gap-3">
          <Label htmlFor="type">Type</Label>
          <RadioGroup
            defaultValue={type}
            id="type"
            className="grid grid-cols-3 gap-4"
            onChange={handleTypeChange}
          >
            <div>
              <RadioGroupItem value="card" id="card" className="peer sr-only" />
              <Label
                htmlFor="card"
                className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="mb-3 h-6 w-6"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <path d="M2 10h20" />
                </svg>
                Multi-sig
              </Label>
            </div>
            <div>
              <RadioGroupItem
                value="paypal"
                id="paypal"
                className="peer sr-only"
              />
              <Label
                htmlFor="paypal"
                className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                {/* <Icons.paypal className="mb-3 h-6 w-6" /> */}
                Personal Vault
              </Label>
            </div>
            <div>
              <RadioGroupItem
                value="2fa"
                id="2fa"
                disabled
                className="peer sr-only"
              />
              <Label
                htmlFor="2fa"
                className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                {/* <Icons.2fa className="mb-3 h-6 w-6" /> */}
                2FA (Coming Soon)
              </Label>
            </div>
          </RadioGroup>
        </div>
        <div className="grid gap-3">
          <Label htmlFor="name">Name</Label>
          <Input
            onChange={handleNameChange}
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
          variant={nameParam ? "default" : "outline"}
          onClick={() => navigateToStep()}
          className="w-32"
        >
          Continue
        </Button>
      </CardFooter>
    </Card>
  );
}
