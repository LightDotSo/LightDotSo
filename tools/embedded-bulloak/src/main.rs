use bulloak::cli;
use std::process;

fn main() {
    if let Err(e) = cli::run() {
        eprintln!("Error: {e:?}");
        process::exit(1);
    }
}
