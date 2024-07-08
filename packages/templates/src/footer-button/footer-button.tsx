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

import { Button, ButtonIcon } from "@lightdotso/ui";
import { cn } from "@lightdotso/utils";
import { XIcon } from "lucide-react";
import type { FC, MouseEvent } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export interface FooterButtonProps {
  className?: string;
  disabled?: boolean;
  form?: string;
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
  form,
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
          onMouseDown={cancelClick}
        >
          Cancel
        </Button>
      </span>
      {form ? (
        <Button
          form={form}
          className="w-full md:w-auto"
          isLoading={isLoading}
          disabled={disabled || isLoading}
          type="submit"
        >
          {customSuccessText ?? "Continue"}
        </Button>
      ) : (
        <Button
          className="w-full md:w-auto"
          isLoading={isLoading}
          disabled={disabled || isLoading}
          onMouseDown={onClick}
        >
          {customSuccessText ?? "Continue"}
        </Button>
      )}
      {isModal ? (
        <span className="inline-flex justify-center md:hidden">
          <ButtonIcon
            size="sm"
            className="rounded-full"
            variant="outline"
            onMouseDown={cancelClick}
          >
            <XIcon />
          </ButtonIcon>
        </span>
      ) : (
        <Button
          className="block w-auto md:hidden"
          variant="outline"
          onMouseDown={cancelClick}
        >
          Cancel
        </Button>
      )}
    </div>
  );
};
