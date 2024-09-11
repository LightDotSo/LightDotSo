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

use autometrics::prometheus_exporter;
use axum::Router;
use eyre::Result;
use lightdotso_tracing::tracing::{info, warn};
use std::net::SocketAddr;
use tokio::net::TcpListener;

pub async fn start_internal_server() -> Result<()> {
    info!("Starting internal server");

    prometheus_exporter::init();

    let app = Router::new()
        .merge(crate::routes::health::router())
        .merge(crate::routes::metrics::router());

    let mut port_number = 9091;
    let max_port_number = 65535;
    let mut socket_addr = SocketAddr::from(([0, 0, 0, 0], port_number));

    while port_number <= max_port_number {
        match TcpListener::bind(socket_addr).await {
            Ok(_) => break,
            Err(_) => {
                port_number += 1;
                warn!("Cannot bind to port, trying next port: {}", port_number);
                socket_addr.set_port(port_number);
            }
        }
    }

    if port_number > max_port_number {
        panic!("No available ports found!");
    }

    let listener = TcpListener::bind(socket_addr).await?;
    axum::serve(listener, app.into_make_service_with_connect_info::<SocketAddr>()).await?;

    Ok(())
}
