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

import { ApiCheck, AssertionBuilder } from "checkly/constructs";
import { websiteGroup, targetUrl } from "__checks__";

new ApiCheck("api-inngest", {
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
    url: `${targetUrl}/api/inngest`,
    method: "GET",
    followRedirects: true,
    skipSSL: false,
    assertions: [
      AssertionBuilder.jsonBody("").hasKey("message"),
      AssertionBuilder.jsonBody("").hasKey("isProd"),
      AssertionBuilder.jsonBody("").hasKey("skipDevServer"),
      AssertionBuilder.statusCode().equals(200),
      AssertionBuilder.responseTme().lessThan(9000),
    ],
    body: "",
    bodyType: "JSON",
    headers: [],
    queryParameters: [],
  },
});
