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

browser.runtime.sendMessage({ greeting: "hello" }).then((response) => {
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.warn("Received response: ", response);
});

browser.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.warn("Received request: ", request);
});
