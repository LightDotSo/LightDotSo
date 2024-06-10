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

export enum Internal {
  CHANGELOG = "Changelog",
  DOCS = "Docs",
  EXPLORER = "Explorer",
  OPEN = "Open",
  PAPER = "Paper",
  HOME = "Home",
  STATUS = "Status",
}

export const INTERNAL_LINKS: {
  readonly [key in Internal]: string;
} = {
  [Internal.CHANGELOG]:
    "https://lightdotso.notion.site/40f7d597317e4f29b06656b03cb32de0",
  [Internal.DOCS]: "https://docs.light.so",
  [Internal.EXPLORER]: "https://explorer.light.so",
  [Internal.OPEN]: "https://open.light.so",
  [Internal.PAPER]: "https://paper.light.so",
  [Internal.HOME]: "https://light.so/home",
  [Internal.STATUS]: "https://lightdotso.instatus.com",
};
