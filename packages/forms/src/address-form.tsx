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

import { EnsAddress, PlaceholderOrb } from "@lightdotso/elements";
import { Avatar, FormField, FormMessage, Input, Label } from "@lightdotso/ui";
import { cn } from "@lightdotso/utils";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import { type FC, type InputHTMLAttributes, useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { isAddress } from "viem";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type AddressFormProps = {
  isLabelHidden?: boolean;
  name: string;
} & InputHTMLAttributes<HTMLInputElement>;

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const AddressForm: FC<AddressFormProps> = ({
  isLabelHidden = true,
  name,
  onKeyDown,
}) => {
  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [spanLeft, setSpanLeft] = useState(0);

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  const methods = useFormContext();

  const watchedName = methods.watch(name);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    // If the form is not dirty, return
    const fieldValue = methods.getValues(name);

    // If the field value is empty, return
    if (!fieldValue) {
      return;
    }

    // Get the length of the input value
    const charLength = fieldValue ? fieldValue.length : 0;

    // Set the span left position based on the length of the input
    setSpanLeft(charLength * 7 + 80);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedName, name, methods]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!methods) {
    return null;
  }

  return (
    <FormField
      control={methods.control}
      name={name}
      render={({ field }) => (
        <div className="grow">
          {!isLabelHidden && <Label htmlFor="address">Address or ENS</Label>}
          <div className="flex items-center space-x-3">
            <div className="relative inline-block w-full">
              <div className="relative">
                <Input
                  id="address"
                  className="pl-12"
                  onKeyDown={onKeyDown}
                  {...field}
                  placeholder="Your address or ENS name"
                />
                <span
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ left: `${spanLeft}px` }}
                >
                  {methods.formState.isValid &&
                  !methods.formState.errors[name] ? (
                    <span className="flex items-center space-x-1">
                      <CheckBadgeIcon className="size-4 text-text-info" />
                      <span className="text-xs text-text-weak">
                        <EnsAddress name={field.value} />
                      </span>
                    </span>
                  ) : field.value && field.value.length > 3 ? (
                    <FormMessage />
                  ) : null}
                </span>
              </div>
              <div className="absolute inset-y-0 left-3 flex items-center">
                <Avatar className="size-6">
                  {/* If the address is valid, try resolving an ens Avatar */}
                  <PlaceholderOrb
                    address={
                      // If the address is a valid address
                      field?.value && isAddress(field.value)
                        ? field?.value
                        : "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed"
                    }
                    className={cn(
                      // If the field is not valid, add opacity
                      methods.formState.errors.owners &&
                        methods.formState.errors[name]
                        ? "opacity-50"
                        : "opacity-100",
                    )}
                  />
                </Avatar>
              </div>
            </div>
          </div>
          {/* <div className="text-text">{JSON.stringify(field, null, 2)}</div> */}
          {/* <div className="text-text">{JSON.stringify(methods, null, 2)}</div> */}
          {/* <FormMessage /> */}
        </div>
      )}
    />
  );
};
