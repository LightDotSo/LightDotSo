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

#![allow(clippy::unwrap_used)]

use crate::{
    admin::admin,
    handle_error,
    routes::{
        activity, auth, check, configuration, feedback, health, invite_code, metrics, notification,
        paymaster, paymaster_operation, portfolio, signature, support_request, token, token_price,
        transaction, user, user_operation, wallet, wallet_settings,
    },
    sessions::{authenticated, RedisStore},
    state::AppState,
};
use axum::{error_handling::HandleErrorLayer, middleware, routing::get, Router};
use axum_tracing_opentelemetry::middleware::{OtelAxumLayer, OtelInResponseLayer};
use eyre::Result;
use http::{
    header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE},
    HeaderValue,
};
use lightdotso_db::db::create_client;
use lightdotso_kafka::get_producer;
use lightdotso_redis::get_redis_client;
use lightdotso_tracing::tracing::info;
use std::{net::SocketAddr, sync::Arc, time::Duration};
use tower::ServiceBuilder;
use tower_governor::{
    governor::GovernorConfigBuilder, key_extractor::SmartIpKeyExtractor, GovernorLayer,
};
use tower_http::cors::{AllowOrigin, CorsLayer};
use tower_sessions::SessionManagerLayer;
use utoipa::{
    openapi::{
        security::{ApiKey, ApiKeyValue, SecurityScheme},
        Components,
    },
    OpenApi,
};
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
        schemas(activity::error::ActivityError),
        schemas(activity::types::Activity),
        schemas(auth::error::AuthError),
        schemas(auth::nonce::AuthNonce),
        schemas(auth::session::AuthSession),
        schemas(auth::verify::AuthVerifyPostRequestParams),
        schemas(configuration::error::ConfigurationError),
        schemas(configuration::types::Configuration),
        schemas(configuration::types::ConfigurationOwner),
        schemas(feedback::create::FeedbackPostRequestParams),
        schemas(feedback::error::FeedbackError),
        schemas(feedback::types::Feedback),
        schemas(invite_code::error::InviteCodeError),
        schemas(invite_code::types::InviteCode),
        schemas(notification::error::NotificationError),
        schemas(notification::read::NotificationReadRequest),
        schemas(notification::read::NotificationReadRequestParams),
        schemas(notification::types::Notification),
        schemas(paymaster::error::PaymasterError),
        schemas(paymaster::types::Paymaster),
        schemas(paymaster_operation::error::PaymasterOperationError),
        schemas(paymaster_operation::types::PaymasterOperation),
        schemas(portfolio::error::PortfolioError),
        schemas(portfolio::types::Portfolio),
        schemas(portfolio::types::PortfolioBalanceDate),
        schemas(signature::error::SignatureError),
        schemas(signature::post::SignaturePostRequestParams),
        schemas(signature::types::Signature),
        schemas(support_request::error::SupportRequestError),
        schemas(support_request::create::SupportRequestPostRequestParams),
        schemas(support_request::types::SupportRequest),
        schemas(token::error::TokenError),
        schemas(token::list::TokenListCount),
        schemas(token::types::Token),
        schemas(token_price::error::TokenPriceError),
        schemas(token_price::types::TokenPrice),
        schemas(token_price::types::TokenPriceDate),
        schemas(transaction::error::TransactionError),
        schemas(transaction::list::TransactionListCount),
        schemas(transaction::types::Transaction),
        schemas(user::error::UserError),
        schemas(user::types::User),
        schemas(user_operation::create::UserOperationCreate),
        schemas(user_operation::create::UserOperationPostRequestParams),
        schemas(user_operation::error::UserOperationError),
        schemas(user_operation::list::UserOperationListCount),
        schemas(user_operation::nonce::UserOperationNonce),
        schemas(user_operation::types::UserOperation),
        schemas(user_operation::types::UserOperationPaymaster),
        schemas(user_operation::types::UserOperationSuccess),
        schemas(user_operation::types::UserOperationSignature),
        schemas(user_operation::types::UserOperationTransaction),
        schemas(wallet::create::WalletPostRequestParams),
        schemas(wallet::error::WalletError),
        schemas(wallet::list::WalletListCount),
        schemas(wallet::types::Owner),
        schemas(wallet::types::Wallet),
        schemas(wallet::update::WalletPutRequestParams),
        schemas(wallet_settings::error::WalletSettingsError),
        schemas(wallet_settings::types::WalletSettings),
        schemas(wallet_settings::types::WalletSettingsOptional),
        schemas(wallet_settings::update::WalletSettingsPostRequestParams),
    ),
    paths(
        activity::v1_activity_get_handler,
        activity::v1_activity_list_handler,
        activity::v1_activity_list_count_handler,
        auth::v1_auth_nonce_handler,
        auth::v1_auth_session_handler,
        auth::v1_auth_logout_handler,
        auth::v1_auth_verify_handler,
        check::handler,
        health::handler,
        configuration::v1_configuration_get_handler,
        configuration::v1_configuration_list_handler,
        feedback::v1_feedback_post_handler,
        invite_code::v1_invite_code_get_handler,
        invite_code::v1_invite_code_list_handler,
        invite_code::v1_invite_code_list_count_handler,
        invite_code::v1_invite_code_post_handler,
        notification::v1_notification_get_handler,
        notification::v1_notification_list_handler,
        notification::v1_notification_list_count_handler,
        notification::v1_notification_read_handler,
        paymaster::v1_paymaster_get_handler,
        paymaster::v1_paymaster_list_handler,
        paymaster_operation::v1_paymaster_operation_get_handler,
        paymaster_operation::v1_paymaster_operation_list_handler,
        portfolio::v1_portfolio_get_handler,
        signature::v1_signature_get_handler,
        signature::v1_signature_list_handler,
        signature::v1_signature_post_handler,
        support_request::v1_support_request_post_handler,
        token::v1_token_get_handler,
        token::v1_token_list_handler,
        token::v1_token_list_count_handler,
        token_price::v1_token_price_get_handler,
        transaction::v1_transaction_get_handler,
        transaction::v1_transaction_list_handler,
        transaction::v1_transaction_list_count_handler,
        user::v1_user_get_handler,
        user_operation::v1_user_operation_get_handler,
        user_operation::v1_user_operation_nonce_handler,
        user_operation::v1_user_operation_list_handler,
        user_operation::v1_user_operation_list_count_handler,
        user_operation::v1_user_operation_post_handler,
        user_operation::v1_user_operation_signature_handler,
        user_operation::v1_user_operation_update_handler,
        wallet::v1_wallet_get_handler,
        wallet::v1_wallet_list_handler,
        wallet::v1_wallet_list_count_handler,
        wallet::v1_wallet_list_count_handler,
        wallet::v1_wallet_post_handler,
        wallet::v1_wallet_update_handler,
        wallet_settings::v1_wallet_settings_get_handler,
        wallet_settings::v1_wallet_settings_post_handler,
    ),
    tags(
        (name = "activity", description = "Activity API"),
        (name = "auth", description = "Auth API"),
        (name = "configuration", description = "Configuration API"),
        (name = "check", description = "Check API"),
        (name = "feedback", description = "Feedback API"),
        (name = "invite_code", description = "Invite Code API"),
        (name = "health", description = "Health API"),
        (name = "notification", description = "Notification API"),
        (name = "paymaster", description = "Paymaster API"),
        (name = "paymaster_operation", description = "Paymaster Operation API"),
        (name = "portfolio", description = "Portfolio API"),
        (name = "signature", description = "Signature API"),
        (name = "support_request", description = "Support Request API"),
        (name = "token", description = "Token API"),
        (name = "token_price", description = "Token Price API"),
        (name = "transaction", description = "Transaction API"),
        (name = "user", description = "User API"),
        (name = "user_operation", description = "User Operation API"),
        (name = "wallet", description = "Wallet API"),
        (name = "wallet_settings", description = "Wallet Settings API"),
    )
)]
#[openapi(
    servers(
        (url = "https://api.light.so/v1", description = "Official API"),
        (url = "https://api.light.so/authenticated/v1", description = "Authenticated API"),
        (url = "https://api.light.so/admin/v1", description = "Internal Admin API"),
        (url = "http://localhost:3000/v1", description = "Local server"),
    )
)]
pub(crate) struct ApiDoc;

pub async fn start_api_server() -> Result<()> {
    info!("Starting API server");

    // Create a shared client
    let db = Arc::new(create_client().await?);
    let producer = Arc::new(get_producer()?);
    let redis = get_redis_client()?;
    let state = AppState { client: db, producer };

    // Allow CORS
    // From: https://github.com/MystenLabs/sui/blob/13df03f2fad0e80714b596f55b04e0b7cea37449/crates/sui-faucet/src/main.rs#L85
    // License: Apache-2.0
    let mut origins = vec!["http://light.so".parse::<HeaderValue>().unwrap()];
    // Get the `ENVIROMENT` variable and if it is `development` then add `http://localhost:3000`
    // to the `origins` array.
    if let Ok(environment) = std::env::var("ENVIRONMENT") {
        if environment == "development" {
            if let Ok(localhost_origin) = "http://localhost:3001".parse() {
                origins.push(localhost_origin);
            }
        }
    }
    let cors = CorsLayer::new()
        .allow_methods([
            http::Method::GET,
            http::Method::PUT,
            http::Method::POST,
            http::Method::PATCH,
            http::Method::DELETE,
            http::Method::OPTIONS,
        ])
        .allow_credentials(true)
        .allow_headers([AUTHORIZATION, ACCEPT, CONTENT_TYPE])
        .allow_origin(AllowOrigin::predicate(move |origin: &HeaderValue, _| {
            origin
                .to_str()
                .map(|origin_string| {
                    origin_string.ends_with(".vercel.app")
                        || origin_string.ends_with(".light.so")
                        || origins
                            .iter()
                            .any(|allowed_origin| allowed_origin.to_str().unwrap() == origin_string)
                })
                .unwrap_or(false)
        }))
        .max_age(Duration::from_secs(86400));

    // Rate limit based on IP address
    // From: https://github.com/benwis/tower-governor
    // License: MIT
    let governor_conf = Box::new(
        GovernorConfigBuilder::default()
            .per_second(10)
            .burst_size(300)
            .use_headers()
            .key_extractor(SmartIpKeyExtractor)
            .finish()
            .unwrap(),
    );

    // Rate limit based on IP address but only for authenticated users
    let authenticated_governor_conf = Box::new(
        GovernorConfigBuilder::default()
            .per_second(3)
            .burst_size(300)
            .use_headers()
            .key_extractor(SmartIpKeyExtractor)
            .finish()
            .unwrap(),
    );

    // Create the API
    let api = Router::new()
        .merge(activity::router())
        .merge(auth::router())
        .merge(configuration::router())
        .merge(check::router())
        .merge(feedback::router())
        .merge(health::router())
        .merge(invite_code::router())
        .merge(metrics::router())
        .merge(notification::router())
        .merge(paymaster::router())
        .merge(paymaster_operation::router())
        .merge(portfolio::router())
        .merge(signature::router())
        .merge(support_request::router())
        .merge(token::router())
        .merge(token_price::router())
        .merge(transaction::router())
        .merge(user::router())
        .merge(user_operation::router())
        .merge(wallet::router())
        .merge(wallet_settings::router());

    // Create the session store
    let session_store = RedisStore::new(redis);
    let session_manager_layer = SessionManagerLayer::new(session_store.clone());

    // Create the api doc
    let mut open_api = ApiDoc::openapi();
    let components = open_api.components.get_or_insert(Components::new());
    components
        .add_security_scheme("sid", SecurityScheme::ApiKey(ApiKey::Cookie(ApiKeyValue::new("id"))));

    // Create the app for the server
    let app = Router::new()
        .route("/", get("api.light.so"))
        .merge(api.clone())
        .merge(SwaggerUi::new("/v1/swagger-ui").url("/api-docs/openapi.json", open_api.clone()))
        .merge(Redoc::with_url("/v1/redoc", open_api.clone()))
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
                .layer(GovernorLayer { config: Box::leak(governor_conf) })
                .layer(session_manager_layer.clone())
                // .layer(SetSensitiveRequestHeadersLayer::from_shared(Arc::clone(&headers)))
                .layer(OtelInResponseLayer)
                .layer(OtelAxumLayer::default())
                .layer(cors.clone())
                .into_inner(),
        )
        .nest(
            "/authenticated/v1",
            api.clone().layer(
                ServiceBuilder::new()
                    .layer(HandleErrorLayer::new(handle_error))
                    .layer(GovernorLayer { config: Box::leak(authenticated_governor_conf) })
                    .layer(session_manager_layer.clone())
                    .layer(middleware::from_fn(authenticated))
                    .layer(OtelInResponseLayer)
                    .layer(OtelAxumLayer::default())
                    .layer(cors.clone())
                    .into_inner(),
            ),
        )
        .nest(
            "/admin/v1",
            api.clone().layer(
                ServiceBuilder::new()
                    .layer(HandleErrorLayer::new(handle_error))
                    .layer(session_manager_layer.clone())
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
