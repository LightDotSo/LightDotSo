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

import { notFound } from "next/navigation";
import { hexRegex } from "@/handlers/regexs/hexNumber";

// -----------------------------------------------------------------------------
// Validator
// -----------------------------------------------------------------------------

export const validateNumber = (value: string): void => {
  // Check if the value is a non-negative integer
  if (/^\d+$/.test(value)) {
    return;
  }

  // Check if the value is Hex
  if (hexRegex.test(value)) {
    return;
  }

  notFound();
};
