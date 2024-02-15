// Copyright 2023-2024 Light, Inc.
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
