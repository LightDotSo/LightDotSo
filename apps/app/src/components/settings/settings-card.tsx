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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Separator,
} from "@lightdotso/ui";
import type { FC, ReactNode } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type SettingsCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footerContent?: ReactNode;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const SettingsCard: FC<SettingsCardProps> = ({
  title,
  subtitle,
  children,
  footerContent,
}) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle>{title}</CardTitle>
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
