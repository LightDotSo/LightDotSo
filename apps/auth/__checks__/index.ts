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

import { CheckGroup } from "checkly/constructs";

export const websiteGroup = new CheckGroup("auth", {
  name: "auth",
  activated: true,
  muted: false,
  runtimeId: "2022.10",
  locations: ["us-east-1", "eu-west-1", "ap-northeast-1"],
  tags: ["auth", "group"],
  environmentVariables: [],
  apiCheckDefaults: {},
  concurrency: 100,
  alertChannels: [],
});

export const targetUrl = process.env.ENVIRONMENT_URL || "https://auth.light.so";
