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

import { ChainLogo } from "@lightdotso/svg";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Separator,
  Skeleton,
} from "@lightdotso/ui";
import type { FC, ReactNode } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type SettingsCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  chainId?: number;
  footerContent?: ReactNode;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const SettingsCard: FC<SettingsCardProps> = ({
  title,
  subtitle,
  children,
  chainId,
  footerContent,
}) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle>
          {chainId ? (
            <div className="flex items-center gap-1.5">
              <ChainLogo chainId={chainId} />
              {title}
            </div>
          ) : (
            title
          )}
        </CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">{children}</CardContent>
      <Separator />
      {footerContent && (
        <CardFooter className="flex w-full items-center justify-end space-x-2 px-4 py-2">
          {footerContent}
        </CardFooter>
      )}
    </Card>
  );
};

// -----------------------------------------------------------------------------
// Skeleton
// -----------------------------------------------------------------------------

export const SettingsCardSkeleton: FC = () => {
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle>
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-40" />
          </div>
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-60" />
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Skeleton className="h-20 w-full" />
      </CardContent>
      <Separator />
      <CardFooter className="flex w-full items-center justify-end space-x-2 px-4 py-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </CardFooter>
    </Card>
  );
};
