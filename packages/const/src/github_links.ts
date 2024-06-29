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

export enum Github {
  ACKNOWLEDGEMENTS = "Acknowledgements",
  AUDIT = "Audit",
  REPO = "Repo",
  LICENSE = "License",
}

export const GITHUB_LINKS: {
  readonly [key in Github]: string;
} = {
  [Github.ACKNOWLEDGEMENTS]:
    "https://github.com/LightDotSo/LightDotSo/blob/main/ACKNOWLEDGEMENTS.md",
  [Github.AUDIT]: "https://github.com/LightDotSo/LightDotSo/blob/main/audits",
  [Github.REPO]: "https://github.com/LightDotSo/LightDotSo",
  [Github.LICENSE]:
    "https://github.com/LightDotSo/LightDotSo/blob/main/LICENSE.md",
};
