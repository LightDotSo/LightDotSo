// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

use glob::glob;
use std::fs;

fn main() {
    let dirs = [
        "ios/**/Sources/**/*.swift",
        "ios/**/Tests/**/*.swift",
        "ios/LightWalletTests/**/*.swift",
        "ios/LightWalletUITests/**/*.swift",
        "crates/**/src/**/*.rs",
        "packages/*/src/**/*.ts",
        "packages/*/src/**/*.tsx",
        "tools/**/src/**/*.rs",
    ];
    let mut failed = false;
    for dir in dirs.iter() {
        glob(dir)
            .expect("Failed to read glob pattern")
            .for_each(|entry| {
                if let Ok(path) = entry {
                    if path
                        .to_str()
                        .unwrap()
                        .contains("Generated/LightWalletCore.swift")
                    {
                        return;
                    }
                    let contents = fs::read_to_string(&path).expect("Failed to read file");
                    if !contents.starts_with(
                        "// This Source Code Form is subject to the terms of the Mozilla Public\n\
                     // License, v. 2.0. If a copy of the MPL was not distributed with this\n\
                     // file, You can obtain one at https://mozilla.org/MPL/2.0/.\n",
                    ) {
                        println!("License header not found in file: {:?}", path);
                        failed = true;
                    }
                }
            });
    }
    if failed {
        panic!("License header check failed");
    }
}
