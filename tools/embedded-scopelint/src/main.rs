// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

use clap::Parser;
use scopelint::config::Opts;
use std::process;

fn main() {
    let opts = Opts::parse();

    if let Err(_err) = scopelint::run(&opts) {
        // All warnings/errors have already been logged.
        process::exit(1);
    }
}
