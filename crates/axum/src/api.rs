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

use crate::{
    admin::admin,
    handle_error,
    routes::{
        check, configuration, feedback, health, notification, signature, support_request,
        transaction, user_operation, wallet,
    },
    state::AppState,
};
use axum::{error_handling::HandleErrorLayer, middleware, routing::get, Router};
use axum_tracing_opentelemetry::middleware::{OtelAxumLayer, OtelInResponseLayer};
use eyre::Result;
use lightdotso_db::db::create_client;
use lightdotso_tracing::tracing::info;
use std::{net::SocketAddr, sync::Arc, time::Duration};
use tower::ServiceBuilder;
use tower_governor::{
    governor::GovernorConfigBuilder, key_extractor::SmartIpKeyExtractor, GovernorLayer,
};
use tower_http::cors::{Any, CorsLayer};
use utoipa::OpenApi;
use utoipa_rapidoc::RapiDoc;
use utoipa_redoc::{Redoc, Servable};
use utoipa_swagger_ui::SwaggerUi;

#[derive(OpenApi)]
#[openapi(info(
    title = "api.light.so",
    description = "API for api.light.so",
    contact(name = "support@light.so")
))]
#[openapi(
    components(
        schemas(configuration::Configuration),
        schemas(configuration::ConfigurationError),
        schemas(configuration::ConfigurationOwner),
        schemas(feedback::Feedback),
        schemas(feedback::FeedbackPostRequestParams),
        schemas(feedback::FeedbackError),
        schemas(notification::Notification),
        schemas(notification::NotificationReadRequest),
        schemas(notification::NotificationReadRequestParams),
        schemas(notification::NotificationError),
        schemas(signature::Signature),
        schemas(signature::SignatureError),
        schemas(signature::SignaturePostRequestParams),
        schemas(support_request::SupportRequest),
        schemas(support_request::SupportRequestPostRequestParams),
        schemas(support_request::SupportRequestError),
        schemas(transaction::Transaction),
        schemas(transaction::TransactionError),
        schemas(user_operation::UserOperation),
        schemas(user_operation::UserOperationCreate),
        schemas(user_operation::UserOperationError),
        schemas(user_operation::UserOperationPostRequestParams),
        schemas(user_operation::UserOperationSignature),
        schemas(wallet::Owner),
        schemas(wallet::Wallet),
        schemas(wallet::WalletError),
        schemas(wallet::WalletPostRequestParams),
    ),
    paths(
        check::handler,
        health::handler,
        configuration::v1_configuration_get_handler,
        configuration::v1_configuration_list_handler,
        feedback::v1_feedback_post_handler,
        notification::v1_notification_get_handler,
        notification::v1_notification_list_handler,
        notification::v1_notification_read_handler,
        signature::v1_signature_get_handler,
        signature::v1_signature_list_handler,
        signature::v1_signature_post_handler,
        support_request::v1_support_request_post_handler,
        transaction::v1_transaction_get_handler,
        transaction::v1_transaction_list_handler,
        user_operation::v1_user_operation_get_handler,
        user_operation::v1_user_operation_list_handler,
        user_operation::v1_user_operation_post_handler,
        user_operation::v1_user_operation_signature_handler,
        wallet::v1_wallet_get_handler,
        wallet::v1_wallet_list_handler,
        wallet::v1_wallet_post_handler,
    ),
    tags(
        (name = "configuration", description = "Configuration API"),
        (name = "check", description = "Check API"),
        (name = "feedback", description = "Feedback API"),
        (name = "health", description = "Health API"),
        (name = "notification", description = "Notification API"),
        (name = "wallet", description = "Wallet API"),
        (name = "signature", description = "Signature API"),
        (name = "support_request", description = "Support Request API"),
        (name = "transaction", description = "Transaction API"),
        (name = "user_operation", description = "User Operation API"),
    )
)]
#[openapi(
    servers(
        (url = "https://api.light.so/v1", description = "Official API"),
        (url = "https://api.light.so/admin/v1", description = "Internal Admin API",
            variables(
                ("username" = (default = "demo", description = "Default username for API")),
            )
        ),
        (url = "http://localhost:3000/v1", description = "Local server"),
    )
)]
struct ApiDoc;

pub async fn start_api_server() -> Result<()> {
    info!("Starting API server");

    // Create a shared client
    let db = Arc::new(create_client().await.unwrap());
    let state = AppState { client: Some(db) };

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

    // Create the API
    let api = Router::new()
        .merge(check::router())
        .merge(health::router())
        .merge(wallet::router())
        .merge(configuration::router())
        .merge(signature::router())
        .merge(transaction::router())
        .merge(user_operation::router());

    // Create the app for the server
    let app = Router::new()
        .route("/", get("api.light.so"))
        .merge(api.clone())
        .merge(SwaggerUi::new("/v1/swagger-ui").url("/api-docs/openapi.json", ApiDoc::openapi()))
        .merge(Redoc::with_url("/v1/redoc", ApiDoc::openapi()))
        // There is no need to create `RapiDoc::with_openapi` because the OpenApi is served
        // via SwaggerUi instead we only make rapidoc to point to the existing doc.
        .merge(RapiDoc::new("/v1/api-docs/openapi.json").path("/rapidoc"))
        .nest("/v1", api.clone())
        .layer(
            // Set up error handling, rate limiting, and CORS
            // From: https://github.com/MystenLabs/sui/blob/13df03f2fad0e80714b596f55b04e0b7cea37449/crates/sui-faucet/src/main.rs#L96C1-L105C19
            // License: Apache-2.0
            ServiceBuilder::new()
                .layer(HandleErrorLayer::new(handle_error))
                // .layer(SetSensitiveRequestHeadersLayer::from_shared(Arc::clone(&headers)))
                .layer(GovernorLayer { config: Box::leak(governor_conf) })
                .layer(OtelInResponseLayer)
                .layer(OtelAxumLayer::default())
                .layer(cors.clone())
                .into_inner(),
        )
        .nest(
            "/admin/v1",
            api.clone().layer(
                ServiceBuilder::new()
                    .layer(middleware::from_fn(admin))
                    .layer(OtelInResponseLayer)
                    .layer(OtelAxumLayer::default())
                    .into_inner(),
            ),
        )
        .layer(ServiceBuilder::new().layer(cors).into_inner())
        .with_state(state);

    let socket_addr = "[::]:3000".parse()?;
    axum::Server::bind(&socket_addr)
        .serve(app.into_make_service_with_connect_info::<SocketAddr>())
        .await?;

    Ok(())
}
