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

import SafariServices
import os.log

class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {
  func beginRequest(with context: NSExtensionContext) {
    // swiftlint:disable force_cast
    let item = context.inputItems[0] as! NSExtensionItem
    let message = item.userInfo?[SFExtensionMessageKey]
    os_log(
      // swiftlint:disable force_cast
      .default, "Received message from browser.runtime.sendNativeMessage: %@", message as! CVarArg
    )

    let response = NSExtensionItem()
    response.userInfo = [SFExtensionMessageKey: ["Response to": message]]

    context.completeRequest(returningItems: [response], completionHandler: nil)
  }
}
