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

export enum Internal {
  ASSETS = "Assets",
  BLOG = "Blog",
  CHANGELOG = "Changelog",
  DOCS = "Docs",
  EXPLORER = "Explorer",
  GOVERNANCE = "Governance",
  OPEN = "Open",
  PAPER = "Paper",
  PROPOSALS = "Proposals",
  HOME = "Home",
  STATUS = "Status",
  SUPPORT = "Support",
  WAITLIST = "Waitlist",
}

export const INTERNAL_LINKS: {
  readonly [key in Internal]: string;
} = {
  [Internal.ASSETS]: "https://assets.light.so",
  [Internal.BLOG]: "https://light.so/blog",
  [Internal.CHANGELOG]: "https://light.so/changelog",
  [Internal.DOCS]: "https://docs.light.so",
  [Internal.EXPLORER]: "https://explorer.light.so",
  [Internal.GOVERNANCE]: "https://gov.light.so",
  [Internal.PAPER]: "https://paper.light.so",
  [Internal.OPEN]: "https://open.light.so",
  [Internal.PROPOSALS]: "https://light.so/proposals",
  [Internal.HOME]: "https://light.so/home",
  [Internal.STATUS]: "https://lightdotso.instatus.com",
  [Internal.SUPPORT]: "https://light.so/support",
  [Internal.WAITLIST]: "https://waitlist.light.so",
};
