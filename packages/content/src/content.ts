// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

browser.runtime.sendMessage({ greeting: "hello" }).then(response => {
  // eslint-disable-next-line no-console
  console.log("Received response: ", response);
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // eslint-disable-next-line no-console
  console.log("Received request: ", request);
});
