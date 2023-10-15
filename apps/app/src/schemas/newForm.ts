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
      addressOrEns: z.string(),
      weight: z
        .number()
        .int()
        .min(1, { message: "Weight must be at least 1." }),
    }),
  ),
});
