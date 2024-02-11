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
import { cn } from "@lightdotso/utils";
import { XIcon } from "lucide-react";
import { useMemo, type FC, type MouseEvent } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export interface FooterButtonProps {
  className?: string;
  disabled?: boolean;
  cancelDisabled?: boolean;
  isLoading?: boolean;
  isModal?: boolean;
  customSuccessText?: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  cancelClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const FooterButton: FC<FooterButtonProps> = ({
  className,
  disabled,
  cancelDisabled,
  isLoading,
  isModal,
  customSuccessText,
  onClick,
  cancelClick,
}) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      className={cn(
        "flex flex-col space-y-4 pt-4 md:flex-row md:items-center md:justify-between md:space-y-0",
        className,
      )}
    >
      <span className="hidden md:block">
        <Button
          disabled={cancelDisabled}
          className="w-auto"
          variant="outline"
          onClick={cancelClick}
        >
          Cancel
        </Button>
      </span>
      <Button
        className="w-full md:w-auto"
        isLoading={isLoading}
        disabled={disabled}
        onMouseDown={onClick}
      >
        {customSuccessText ?? "Continue"}
      </Button>
      {isModal ? (
        <span className="inline-flex justify-center md:hidden">
          <ButtonIcon
            size="sm"
            className="rounded-full"
            variant="outline"
            onClick={cancelClick}
          >
            <XIcon />
          </ButtonIcon>
        </span>
      ) : (
        <Button
          className="block w-auto md:hidden"
          variant="outline"
          onClick={cancelClick}
        >
          Cancel
        </Button>
      )}
    </div>
  );
};
