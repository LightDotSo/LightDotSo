// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

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
