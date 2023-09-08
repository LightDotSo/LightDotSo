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

// FIXME: Remove after test code
#![allow(unreachable_code)]
#![allow(unused_imports)]

// All resources are from reth-tracing: https://github.com/paradigmxyz/reth/blob/0096739dbb192b419e1a3aa89d34c202c7a554af/crates/tracing/src/lib.rs
// Thank you for providing such an awesome library!
use base64::{engine::general_purpose, Engine as _};
use dotenvy::dotenv;
use eyre::Result;
use opentelemetry::sdk::{
    propagation::TraceContextPropagator,
    resource::{OsResourceDetector, ProcessResourceDetector, ResourceDetector},
    Resource,
};
use opentelemetry_otlp::WithExportConfig;
use std::{thread, time::Duration};
// use pyroscope::PyroscopeAgent;
use pyroscope_pprofrs::{pprof_backend, PprofConfig};
use tonic_0_9::metadata::MetadataMap;
use tracing::{event, info, instrument, Level, Subscriber};
use tracing_loki::url::Url;
use tracing_subscriber::{
    filter::Directive, prelude::*, registry::LookupSpan, EnvFilter, Layer, Registry,
};

mod constants;

// From: https://github.com/paradigmxyz/reth/blob/428a6dc2f63ac7f2798c0cb56cf099108d7cbd00/crates/tracing/src/lib.rs#L28-L30
// Re-export tracing crates
pub use tracing;
pub use tracing_futures;
pub use tracing_subscriber;

use crate::constants::{LOKI_USER_ID, PYROSCOPE_USER_ID, TEMPO_USER_ID};

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

/// From: https://github.com/autometrics-dev/autometrics-rs/blob/0801acbe0db735c85324c8f70302af056d3fe9c2/examples/opentelemetry-push/src/main.rs#L11C1-L27C1
/// License: MIT
/// Also heavily inspired by: https://github.com/senate-xyz/senate/blob/19d565957554673429f9391eee2af7261f1b44b4/apps/email-secretary/src/telemetry.rs#L29C1-L75C81
/// License: GPL-3.0
/// Initializes a new push-based OpenTelemetry metrics pipeline.
pub fn init_metrics() -> Result<()> {
    info!("Initializing metrics pipeline...");

    // Initialize the pyroscope agent
    // let pyroscope_agent;

    // Load the environment variables from the .env file
    let _ = dotenv();

    // Retrieve the required environment variables for tracing
    let fly_app_name = std::env::var("FLY_APP_NAME").unwrap();
    let grafana_api_key = std::env::var("GRAFANA_API_KEY").unwrap();

    // Determine the log level based on the environment
    let log_level = match std::env::var("ENVIRONMENT").unwrap_or_default().as_str() {
        "development" => Level::TRACE,
        _ => Level::INFO,
    };

    // Set the global propagator to the W3C Trace Context propagator
    opentelemetry::global::set_text_map_propagator(TraceContextPropagator::new());

    // Initialize the Loki layer
    // let (logging_layer, task) = tracing_loki::builder()
    //     .build_url(Url::parse("http://lightdotso-loki.internal").unwrap())
    //     .unwrap();

    // Encode the telemetry key for basic authentication for Tempo
    let mut metadata = MetadataMap::new();
    let encoded =
        general_purpose::STANDARD.encode(format!("{}:{}", *TEMPO_USER_ID, grafana_api_key));
    metadata.insert("authorization", format!("Basic {}", encoded).parse().unwrap());

    // Merge the detected resources with the service name for Tempo
    let resources = OsResourceDetector
        .detect(std::time::Duration::from_secs(0))
        .merge(&ProcessResourceDetector.detect(std::time::Duration::from_secs(0)))
        .merge(&Resource::new(vec![opentelemetry::KeyValue::new(
            "service.name",
            fly_app_name.clone(),
        )]));

    // Initialize the OpenTelemetry tracing pipeline w/ authentication for Tempo
    // https://grafana.com/docs/grafana-cloud/monitor-infrastructure/otlp/send-data-otlp/
    // https://community.grafana.com/t/opentelemetry-endpoint-of-grafana-cloud/85359/5
    // Bug with https://github.com/hyperium/tonic/issues/1427, disabling for now
    let tracer = opentelemetry_otlp::new_pipeline()
        .tracing()
        .with_exporter(
            opentelemetry_otlp::new_exporter()
                .tonic()
                .with_endpoint("http://lightdotso-grafana-agent.internal:4317")
                .with_metadata(metadata),
        )
        .with_trace_config(
            opentelemetry::sdk::trace::config()
                .with_id_generator(opentelemetry::sdk::trace::RandomIdGenerator::default())
                .with_sampler(opentelemetry::sdk::trace::Sampler::AlwaysOn)
                .with_resource(resources),
        )
        .install_batch(opentelemetry::runtime::Tokio)
        .unwrap();

    // Create the OpenTelemetry layer
    let telemetry_layer = tracing_opentelemetry::layer().with_tracer(tracer);

    // Initialize the tracing subscriber
    tracing_subscriber::registry()
        // .with(logging_layer)
        .with(telemetry_layer)
        .with(stdout(log_level))
        .init();

    // Spawn the Loki task
    // tokio::spawn(task);

    // wait for a bit before starting to push logs and traces
    thread::sleep(Duration::from_secs(3));

    // // Construct the Pyroscope agent
    // pyroscope_agent =
    //     PyroscopeAgent::builder("https://profiles-prod-001.grafana.net", &fly_app_name.clone())
    //         .backend(pprof_backend(PprofConfig::new().sample_rate(100)))
    //         .basic_auth(PYROSCOPE_USER_ID.to_string(), grafana_api_key.clone())
    //         .build()
    //         .unwrap();

    // // Start the Pyroscope agent
    // let _ = pyroscope_agent.start().unwrap();

    info!("Successfully initialized metrics pipeline");

    // Loop forever
    loop {
        // Sleep for 1 second
        thread::sleep(Duration::from_secs(1));
        function();
    }

    Ok(())
}

#[instrument]
pub fn function() {
    event!(Level::INFO, "this is an event");
}
