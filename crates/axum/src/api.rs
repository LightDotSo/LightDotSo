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

use crate::handle_error;
use axum::{error_handling::HandleErrorLayer, routing::get, Router};
use eyre::Result;
use lightdotso_tracing::tracing::Level;
use std::{net::SocketAddr, time::Duration};
use tower::ServiceBuilder;
use tower_governor::{
    governor::GovernorConfigBuilder, key_extractor::SmartIpKeyExtractor, GovernorLayer,
};
use tower_http::{
    cors::{Any, CorsLayer},
    trace::{DefaultMakeSpan, DefaultOnRequest, DefaultOnResponse, TraceLayer},
};
use utoipa::OpenApi;
use utoipa_rapidoc::RapiDoc;
use utoipa_redoc::{Redoc, Servable};
use utoipa_swagger_ui::SwaggerUi;

#[derive(OpenApi)]
#[openapi(
        // paths(
        //     todo::list_todos,
        //     todo::search_todos,
        //     todo::create_todo,
        //     todo::mark_done,
        //     todo::delete_todo,
        // ),
        // components(
        //     schemas(todo::Todo, todo::TodoError)
        // ),
        // modifiers(&SecurityAddon),
        tags(
            (name = "todo", description = "Todo items management API")
        )
    )]
struct ApiDoc;

pub async fn start_api_server() -> Result<()> {
    // Allow CORS
    // From: https://github.com/MystenLabs/sui/blob/13df03f2fad0e80714b596f55b04e0b7cea37449/crates/sui-faucet/src/main.rs#L85
    // License: Apache-2.0
    let cors = CorsLayer::new()
        .allow_methods([
            http::Method::GET,
            http::Method::PUT,
            http::Method::POST,
            http::Method::PATCH,
            http::Method::DELETE,
            http::Method::OPTIONS,
        ])
        .allow_headers(Any)
        .allow_origin(Any)
        .max_age(Duration::from_secs(86400));

    // Rate limit based on IP address
    // From: https://github.com/benwis/tower-governor
    // License: MIT
    let governor_conf = Box::new(
        GovernorConfigBuilder::default()
            .per_second(30)
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
        .route("/", get("api.light.so"))
        .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", ApiDoc::openapi()))
        .merge(Redoc::with_url("/redoc", ApiDoc::openapi()))
        // There is no need to create `RapiDoc::with_openapi` because the OpenApi is served
        // via SwaggerUi instead we only make rapidoc to point to the existing doc.
        .merge(RapiDoc::new("/api-docs/openapi.json").path("/rapidoc"))
        // Alternative to above
        .merge(RapiDoc::with_openapi("/api-docs/openapi2.json", ApiDoc::openapi()).path("/rapidoc"))
        .layer(
            // Set up error handling, rate limiting, and CORS
            // From: https://github.com/MystenLabs/sui/blob/13df03f2fad0e80714b596f55b04e0b7cea37449/crates/sui-faucet/src/main.rs#L96C1-L105C19
            // License: Apache-2.0
            ServiceBuilder::new()
                .layer(HandleErrorLayer::new(handle_error))
                // .layer(SetSensitiveRequestHeadersLayer::from_shared(Arc::clone(&headers)))
                .layer(trace_layer.clone())
                .layer(GovernorLayer { config: Box::leak(governor_conf) })
                .layer(cors)
                .into_inner(),
        );

    let socket_addr = "[::]:3000".parse()?;
    axum::Server::bind(&socket_addr)
        .serve(app.into_make_service_with_connect_info::<SocketAddr>())
        .await?;

    Ok(())
}
