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

// All resources are from reth: https://github.com/paradigmxyz/reth/blob/0096739dbb192b419e1a3aa89d34c202c7a554af/crates/tracing/src/lib.rs
// Thank you for providing such an awesome library!

use tracing::Subscriber;
use tracing_subscriber::{
    filter::Directive, prelude::*, registry::LookupSpan, EnvFilter, Layer, Registry,
};

/// From: https://github.com/paradigmxyz/reth/blob/428a6dc2f63ac7f2798c0cb56cf099108d7cbd00/crates/tracing/src/lib.rs#L32
/// A boxed tracing [Layer].
pub type BoxedLayer<S> = Box<dyn Layer<S> + Send + Sync>;

/// From: https://github.com/paradigmxyz/reth/blob/428a6dc2f63ac7f2798c0cb56cf099108d7cbd00/crates/tracing/src/lib.rs#L35-L38
/// Initializes a new [Subscriber] based on the given layers.
pub fn init(layers: Vec<BoxedLayer<Registry>>) {
    tracing_subscriber::registry().with(layers).init();
}

/// From: https://github.com/paradigmxyz/reth/blob/428a6dc2f63ac7f2798c0cb56cf099108d7cbd00/crates/tracing/src/lib.rs#L40-L64
/// Builds a new tracing layer that writes to stdout.
///
/// The events are filtered by `default_directive`, unless overridden by `RUST_LOG`.
///
/// Colors can be disabled with `RUST_LOG_STYLE=never`, and event targets can be displayed with
/// `RUST_LOG_TARGET=1`.
pub fn stdout<S>(default_directive: impl Into<Directive>) -> BoxedLayer<S>
where
    S: Subscriber,
    for<'a> S: LookupSpan<'a>,
{
    // TODO: Auto-detect
    let with_ansi = std::env::var("RUST_LOG_STYLE").map(|val| val != "never").unwrap_or(true);
    let with_target = std::env::var("RUST_LOG_TARGET").map(|val| val != "0").unwrap_or(true);

    let filter =
        EnvFilter::builder().with_default_directive(default_directive.into()).from_env_lossy();

    tracing_subscriber::fmt::layer()
        .with_ansi(with_ansi)
        .with_target(with_target)
        .with_filter(filter)
        .boxed()
}

/// From: https://github.com/paradigmxyz/reth/blob/428a6dc2f63ac7f2798c0cb56cf099108d7cbd00/crates/tracing/src/lib.rs#L110-L123
/// Initializes a tracing subscriber for tests.
///
/// The filter is configurable via `RUST_LOG`.
///
/// # Note
///
/// The subscriber will silently fail if it could not be installed.
pub fn init_test_tracing() {
    let _ = tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .with_writer(std::io::stderr)
        .try_init();
}

#[cfg(test)]
mod tests {
    use super::*;
    use tracing::{info, Level};

    #[test]
    fn test_stdout_layer() {
        let layers = vec![stdout(Level::INFO)];
        init(layers);
        info!("This is a test log message");
    }

    #[test]
    fn test_init_test_tracing() {
        init_test_tracing();
        info!("This is a test log message");
    }
}
