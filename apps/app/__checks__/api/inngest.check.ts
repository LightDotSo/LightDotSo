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

import { ApiCheck, AssertionBuilder } from "checkly/constructs";
import { targetUrl, websiteGroup } from "..";

new ApiCheck("app-inngest", {
  name: "API Inngest",
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
    // biome-ignore lint/style/useNamingConvention: <explanation>
    skipSSL: false,
    assertions: [
      AssertionBuilder.jsonBody("").hasKey("message"),
      AssertionBuilder.statusCode().equals(200),
    ],
    body: "",
    bodyType: "JSON",
    headers: [],
    queryParameters: [],
  },
});
