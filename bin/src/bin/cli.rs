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
#[command(author, version = "0.1", about = "lightdotso-bin-cli", long_about = None)]
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
    use eyre::Result;
    use std::process::Command;

    #[test]
    fn test_cli_parse() -> Result<()> {
        // Test that the Cli struct can be parsed from command line arguments
        let cli = Cli::parse_from(["lightdotso-bin-cli", "indexer"]);
        assert!(matches!(cli.command, Commands::Indexer(_)));
        Ok(())
    }

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
        assert!(stderr.contains("lightdotso-bin-cli"));
    }
}
