// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

pub fn rust_greeting(to: String) -> String {
    format!("Hello World, {}!", to)
}

pub fn keychain_hello_world() -> String {
    "Hello World from Keychain".to_string()
}
