// Copyright 2023-2024 Light.
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

import { isAddress } from "viem";
import { z } from "zod";
import { address, addressOrEns } from "../web3";

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
  inviteCode: z
    .string()
    .length(7, {
      message: "Invite code should be 7 characters including the dash.",
    })
    .regex(/^[A-Z0-9]{3}-[A-Z0-9]{3}$/, {
      message: "Should only contain A-Z or 0-9.",
    }),
});

const BYTES32_REGEX = /^0x[a-fA-F0-9]{64}$/;

export const newFormConfigurationSchema = z.object({
  salt: z.string().refine(value => BYTES32_REGEX.test(value), {
    message: "Input should be a valid bytes32 value",
  }),
  threshold: z
    .number()
    .int()
    .min(1, { message: "Threshold must be at least 1." }),
  owners: z.array(
    z.object({
      address: address.optional(),
      addressOrEns: addressOrEns.optional(),
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
