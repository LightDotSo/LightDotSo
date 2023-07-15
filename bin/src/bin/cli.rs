// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

/// Main entry point for the wallet cli.
/// Structue of the CLI is extremely influenced from reth.
/// https://github.com/paradigmxyz/reth/tree/main/bin/reth
use clap::{ArgAction, Args, Parser, Subcommand};
use lightdotso_tracing::{
    tracing::{metadata::LevelFilter, Level},
    tracing_subscriber::{filter::Directive, EnvFilter},
};

/// Parse CLI options, set up logging and run the chosen command.
pub async fn run() -> eyre::Result<()> {
    // Parse CLI options
    let opt = Cli::parse();

    // Set up logging based on the verbosity level
    let filter =
        EnvFilter::builder().with_default_directive(opt.verbosity.directive()).from_env_lossy();
    lightdotso_tracing::tracing_subscriber::fmt().with_env_filter(filter).init();

    // Run the chosen command
    match opt.command {
        Commands::Indexer(m) => m.run().await,
    }
}

/// Commands to be executed
#[derive(Subcommand)]
pub enum Commands {
    /// Run the indexer command utilities
    #[command(name = "indexer")]
    Indexer(lightdotso_indexer::config::ConfigArgs),
}

#[derive(Parser)]
#[command(author, version = "0.1", about = "lightdotso", long_about = None)]
struct Cli {
    /// The command to run
    #[clap(subcommand)]
    command: Commands,

    #[clap(flatten)]
    verbosity: Verbosity,
}

#[derive(Args)]
#[command(next_help_heading = "Display")]
struct Verbosity {
    /// Set the minimum log level.
    ///
    /// -v      Errors
    /// -vv     Warnings
    /// -vvv    Info
    /// -vvvv   Debug
    /// -vvvvv  Traces
    #[clap(short, long, action = ArgAction::Count, global = true, default_value_t = 3, verbatim_doc_comment, help_heading = "Display")]
    verbosity: u8,

    /// Silence all log output.
    #[clap(long, alias = "silent", short = 'q', global = true, help_heading = "Display")]
    quiet: bool,
}

impl Verbosity {
    /// Get the corresponding [Directive] for the given verbosity, or none if the verbosity
    /// corresponds to silent.
    fn directive(&self) -> Directive {
        if self.quiet {
            LevelFilter::OFF.into()
        } else {
            let level = match self.verbosity - 1 {
                0 => Level::ERROR,
                1 => Level::WARN,
                2 => Level::INFO,
                3 => Level::DEBUG,
                _ => Level::TRACE,
            };

            level.into()
        }
    }
}

/// Main entry point for the wallet cli.
///
/// From:
/// https://github.com/paradigmxyz/reth/blob/df6ff63806cc6d3aa168278514b8d854f771d4b6/bin/reth/src/main.rs
#[tokio::main]
async fn main() {
    if let Err(err) = run().await {
        eprintln!("Error: {err:?}");
        std::process::exit(1);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use clap::CommandFactory;
    use eyre::Result;
    use std::process::Command;

    /// Test that the CLI can be parsed from command line arguments
    #[test]
    fn test_cli_parse() -> Result<()> {
        // Test that the Cli struct can be parsed from command line arguments
        let cli = Cli::parse_from(["lightdotso-bin", "indexer"]);
        assert!(matches!(cli.command, Commands::Indexer(_)));
        Ok(())
    }

    /// Test that the verbosity level is correctly parsed
    #[test]
    fn test_verbosity() {
        // Test that the verbosity level is correctly parsed
        let verbosity = Verbosity { verbosity: 1, quiet: false };
        assert_eq!(verbosity.directive(), LevelFilter::ERROR.into());

        let verbosity = Verbosity { verbosity: 2, quiet: false };
        assert_eq!(verbosity.directive(), LevelFilter::WARN.into());

        let verbosity = Verbosity { verbosity: 3, quiet: false };
        assert_eq!(verbosity.directive(), LevelFilter::INFO.into());

        let verbosity = Verbosity { verbosity: 4, quiet: false };
        assert_eq!(verbosity.directive(), LevelFilter::DEBUG.into());

        let verbosity = Verbosity { verbosity: 5, quiet: false };
        assert_eq!(verbosity.directive(), LevelFilter::TRACE.into());

        let verbosity = Verbosity { verbosity: 1, quiet: true };
        assert_eq!(verbosity.directive(), LevelFilter::OFF.into());
    }

    /// Test that the CLI can be parsed from command line arguments
    #[test]
    fn test_main() {
        // Run the CLI with no arguments
        let output =
            Command::new("cargo").args(["run"]).output().expect("Failed to execute command");
        println!("output: {:?}", output);

        // Check that the CLI exited with an error (waiting status)
        assert!(!output.status.success());

        // Check that the CLI printed the help message
        let stderr = String::from_utf8_lossy(&output.stderr);
        assert!(stderr.contains("lightdotso"));
    }

    /// From reth: https://github.com/paradigmxyz/reth/blob/428a6dc2f63ac7f2798c0cb56cf099108d7cbd00/bin/reth/src/cli.rs#L181
    /// Tests that the help message is parsed correctly. This ensures that clap args are configured
    /// correctly and no conflicts are introduced via attributes that would result in a panic at
    /// runtime
    #[test]
    fn test_parse_help_all_subcommands() {
        let reth = Cli::command();
        for sub_command in reth.get_subcommands() {
            let err = Cli::try_parse_from(["lightdotso", sub_command.get_name(), "--help"])
                .err()
                .unwrap_or_else(|| {
                    panic!("Failed to parse help message {}", sub_command.get_name())
                });

            // --help is treated as error, but
            // > Not a true "error" as it means --help or similar was used. The help message will be sent to stdout.
            assert_eq!(err.kind(), clap::error::ErrorKind::DisplayHelp);
        }
    }
}
