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

export const camelCaseToCapitalizedWords = (input: string): string => {
  // Split the string at each point where a lowercase letter is followed by an uppercase letter
  const words = input.split(/(?=[A-Z])/);

  // Capitalize the first letter of each word and make sure the rest of the letters are lowercase
  const capitalizedWords = words.map(
    word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
  );

  // Join the words back into a single string with spaces
  return capitalizedWords.join(" ");
};
