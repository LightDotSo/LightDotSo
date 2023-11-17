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

import * as z from "zod";
import { isAddress } from "viem";

// -----------------------------------------------------------------------------
// Schema
// -----------------------------------------------------------------------------

export const newFormSchema = z.object({
  type: z.enum(["multi", "personal", "2fa"], {
    required_error: "Please select a type.",
  }),
  name: z
    .string()
    .min(1, { message: "Name cannot be empty." })
    .max(30, { message: "Name should be less than 30 characters." }),
});

const BYTES32_REGEX = /^0x[a-fA-F0-9]{64}$/;

export const newFormConfigurationSchema = z.object({
  check: z.boolean(),
  salt: z.string().refine(value => BYTES32_REGEX.test(value), {
    message: "Input should be a valid bytes32 value",
  }),
  threshold: z
    .number()
    .int()
    .min(1, { message: "Threshold must be at least 1." }),
  owners: z.array(
    z.object({
      address: z
        .string()
        .min(1, { message: "Please enter a valid address." })
        .optional(),
      addressOrEns: z.string().optional(),
      weight: z
        .number()
        .int()
        .min(1, { message: "Weight must be at least 1." }),
    }),
  ),
});

export const newFormConfigurationRefinedSchema =
  newFormConfigurationSchema.superRefine((value, ctx) => {
    // The sum of the weights of all owners must be greater than or equal to the threshold.
    const sum = value.owners.reduce((acc, owner) => acc + owner.weight, 0);

    if (sum < value.threshold) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        message:
          "The sum of the weights of all owners must be greater than or equal to the threshold.",
        minimum: value.threshold,
        path: ["threshold"],
        type: "number",
        inclusive: true,
      });
    }

    // Check if no two owners have the same address
    const addresses = value.owners
      .map(owner => owner?.address)
      .filter(address => address && address.trim() !== "");
    const uniqueAddresses = new Set(addresses);
    if (uniqueAddresses.size !== addresses.length) {
      // Add an error to the duplicate address
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Duplicate address",
        path: ["duplicate"],
      });
    }

    // Also expect that all owners w/ key address are valid addresses and are not empty
    value.owners.forEach((owner, index) => {
      // Check if the address is not empty
      if (!owner.address) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Address is required",
          path: ["owners", index, "address"],
        });
      }

      if (owner.address && !isAddress(owner.address)) {
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_type,
          message: "Invalid address",
          path: ["owners", index, "address"],
          expected: "string",
          received: "string",
        });
      }
    });
  });

export const newFormConfirmSchema = z.object({
  check: z.boolean(),
});

// Import and combine all schemas
export const newFormStoreSchema = z.intersection(
  z.intersection(newFormSchema, newFormConfigurationRefinedSchema),
  newFormConfirmSchema,
);
