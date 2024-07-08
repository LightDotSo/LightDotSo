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

import { CheckGroup } from "checkly/constructs";

export const websiteGroup = new CheckGroup("app", {
  name: "app",
  activated: true,
  muted: false,
  runtimeId: "2022.10",
  locations: ["us-east-1", "eu-west-1", "ap-northeast-1"],
  tags: ["app", "group"],
  environmentVariables: [],
  apiCheckDefaults: {},
  concurrency: 100,
  alertChannels: [],
});

export const targetUrl = process.env.ENVIRONMENT_URL || "https://app.light.so";
