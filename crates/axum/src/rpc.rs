// Copyright 2023-2024 LightDotSo.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2017-present Horizon Blockchain Games Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#![allow(clippy::unwrap_used)]

// use crate::handle_error;
use axum::{
    // error_handling::HandleErrorLayer,
    routing::{get, on, MethodFilter},
    Router,
};
use clap::Parser;
use eyre::Result;
use hyper::http::Method;
use lightdotso_hyper::get_hyper_client;
use lightdotso_kafka::get_producer;
use lightdotso_rpc::{
    config::RpcArgs, internal_rpc_handler, protected_rpc_handler, public_rpc_handler,
};
use lightdotso_tracing::tracing::{info, Level};
use std::{net::SocketAddr, sync::Arc, time::Duration};
use tokio::net::TcpListener;
use tower::ServiceBuilder;
use tower_governor::{
    governor::GovernorConfigBuilder, key_extractor::SmartIpKeyExtractor, GovernorLayer,
};
use tower_http::{
    cors::{Any, CorsLayer},
    trace::{DefaultMakeSpan, DefaultOnRequest, DefaultOnResponse, TraceLayer},
};

pub async fn start_rpc_server() -> Result<()> {
    info!("Starting RPC server");

    // Create a client
    let client = get_hyper_client()?;
    let producer = Arc::new(get_producer()?);

    // Get the config
    let _ = RpcArgs::try_parse().unwrap_or_else(|_| RpcArgs::parse_from(["".to_string()]));

    // Allow CORS
    // From: https://github.com/MystenLabs/sui/blob/13df03f2fad0e80714b596f55b04e0b7cea37449/crates/sui-faucet/src/main.rs#L85
    // License: Apache-2.0
    let cors = CorsLayer::new()
        .allow_methods([
            Method::GET,
            Method::PUT,
            Method::POST,
            Method::PATCH,
            Method::DELETE,
            Method::OPTIONS,
        ])
        .allow_headers(Any)
        .allow_origin(Any)
        .max_age(Duration::from_secs(86400));

    // Rate limit based on IP address
    // From: https://github.com/benwis/tower-governor
    // License: MIT
    let governor_conf = Arc::new(
        GovernorConfigBuilder::default()
            .per_millisecond(300)
            .burst_size(100)
            .use_headers()
            .key_extractor(SmartIpKeyExtractor)
            .finish()
            .unwrap(),
    );

    // Trace requests and responses w/ span
    // From: https://github.com/quasiuslikecautious/commerce-api/blob/73fb24667665e87d0909716657f949e3ce9c2990/src/middlewares/lib.rs#L83
    // License: MIT
    let trace_layer = TraceLayer::new_for_http()
        .make_span_with(DefaultMakeSpan::new().include_headers(true))
        .on_request(DefaultOnRequest::new().level(Level::INFO))
        .on_response(DefaultOnResponse::new().level(Level::INFO));

    let app = Router::new()
        .route("/", get("rpc.light.so"))
        .route(
            "/:chain_id",
            on(
                MethodFilter::POST.or(MethodFilter::GET).or(MethodFilter::OPTIONS),
                public_rpc_handler,
            ),
        )
        .layer(
            // Set up error handling, rate limiting, and CORS
            // From: https://github.com/MystenLabs/sui/blob/13df03f2fad0e80714b596f55b04e0b7cea37449/crates/sui-faucet/src/main.rs#L96C1-L105C19
            // License: Apache-2.0
            ServiceBuilder::new()
                // .layer(HandleErrorLayer::new(handle_error))
                .layer(trace_layer.clone())
                //  .layer(SetSensitiveRequestHeadersLayer::from_shared(Arc::clone(&headers)))
                .layer(GovernorLayer {
                    // We can leak this because it is created only once and it persists.
                    config: governor_conf,
                })
                // .layer(HandleErrorLayer::new(handle_error))
                .layer(cors), // .into_inner(),
        )
        .route(
            "/protected/:key/:chain_id",
            on(MethodFilter::POST.or(MethodFilter::GET), protected_rpc_handler),
        )
        .route(
            "/internal/:chain_id",
            on(MethodFilter::POST.or(MethodFilter::GET), internal_rpc_handler),
        )
        .layer(ServiceBuilder::new().layer(trace_layer.clone()).into_inner())
        .with_state((client, producer));

    let socket_addr = "[::]:3000";
    let listener = TcpListener::bind(socket_addr).await?;
    axum::serve(listener, app.into_make_service_with_connect_info::<SocketAddr>()).await?;

    Ok(())
}
