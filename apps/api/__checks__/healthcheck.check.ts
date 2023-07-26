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

import { ApiCheck, AssertionBuilder, CheckGroup } from "checkly/constructs";

export const websiteGroup = new CheckGroup("API", {
  name: "API Group",
  activated: true,
  muted: false,
  runtimeId: "2022.10",
  locations: ["us-east-1", "eu-west-1"],
  tags: ["mac", "group"],
  environmentVariables: [],
  apiCheckDefaults: {},
  concurrency: 100,
  alertChannels: [],
});

const targetUrl = process.env.ENVIRONMENT_URL || "https://api.light.so";

new ApiCheck("api-healthcheck", {
  name: "API Healthcheck",
  group: websiteGroup,
  activated: true,
  muted: false,
  doubleCheck: true,
  shouldFail: false,
  locations: ["eu-west-1", "us-west-1"],
  tags: ["api"],
  frequency: 60,
  environmentVariables: [],
  maxResponseTime: 20000,
  degradedResponseTime: 50000,
  request: {
    url: `${targetUrl}/api/trpc/healthcheck`,
    method: "GET",
    followRedirects: true,
    skipSSL: false,
    assertions: [
      AssertionBuilder.jsonBody("").hasKey("result"),
      AssertionBuilder.statusCode().equals(200),
      AssertionBuilder.responseTme().lessThan(4500),
    ],
    body: "",
    bodyType: "JSON",
    headers: [],
    queryParameters: [],
  },
});
