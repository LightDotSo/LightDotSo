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

import { Button, ButtonIcon } from "@lightdotso/ui";
import { XIcon } from "lucide-react";
import Link from "next/link";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export interface FooterButtonProps {
  disabled?: boolean;
  isLoading?: boolean;
  href?: string;
  successClick?: () => void;
  cancelClick?: () => void;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const FooterButton: FC<FooterButtonProps> = ({
  disabled,
  isLoading,
  href,
  successClick,
  cancelClick,
}) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col space-y-4 pt-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      <span className="hidden md:block">
        <Button className="w-auto" variant="outline" onClick={cancelClick}>
          Cancel
        </Button>
      </span>
      {!href || isLoading || disabled ? (
        <Button
          className="w-full md:w-auto"
          isLoading={isLoading}
          disabled={disabled}
          type="submit"
          onClick={successClick}
        >
          Continue
        </Button>
      ) : (
        <Button
          asChild
          className="w-full md:w-auto"
          isLoading={isLoading}
          disabled={disabled}
          type="submit"
          onClick={successClick}
        >
          <Link href={href}>Continue</Link>
        </Button>
      )}
      <span className="inline-flex justify-center md:hidden">
        <ButtonIcon
          className="rounded-full"
          variant="outline"
          onClick={cancelClick}
        >
          <XIcon />
        </ButtonIcon>
      </span>
    </div>
  );
};
