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

import { useAuth } from "@lightdotso/stores";
import { ConnectButton } from "@lightdotso/templates/connect-button";
import { Button } from "@lightdotso/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lightdotso/ui/components/card";
import { Gamepad, PlayCircleIcon, Wallet } from "lucide-react";
import Link from "next/link";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const RootWelcomeCards: FC = () => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { address } = useAuth();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="grid w-full gap-4 md:grid-cols-2">
      {address ? (
        <Card className="col-span-1 p-4">
          <CardHeader>
            <div>
              <span className="inline-block rounded-full border border-border-warning bg-background-warning-weakest p-2">
                <PlayCircleIcon className="size-5 text-border-warning" />
              </span>
            </div>
            <CardTitle>Swap</CardTitle>
            <CardDescription>Swap tokens on Light.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Button asChild size="default" variant="outline">
              <Link href="/swap">
                <PlayCircleIcon className="mr-2 size-4" />
                Swap
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="col-span-1 p-4">
          <CardHeader>
            <div>
              <span className="inline-block rounded-full border border-border-warning bg-background-warning-weakest p-2">
                <Wallet className="size-5 text-border-warning" />
              </span>
            </div>
            <CardTitle>Connect to Light</CardTitle>
            <CardDescription>
              Connect your wallet to Light to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <ConnectButton />
          </CardContent>
        </Card>
      )}
      <Card className="col-span-1 p-4">
        <CardHeader>
          <div>
            <span className="inline-block rounded-full border border-border-purple bg-background-purple-weakest p-2">
              <Gamepad className="size-5 text-border-purple" />
            </span>
          </div>
          <CardTitle>Try demo mode</CardTitle>
          <CardDescription>
            Experience Light in demo mode. No wallet required.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Button asChild size="default" variant="outline">
            <Link href="/demo/overview">
              <Gamepad className="mr-2 size-4" /> Start Demo
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
