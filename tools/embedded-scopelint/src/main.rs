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
