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

use crate::{
    admin::admin,
    constants::SESSION_COOKIE_ID,
    handle_error,
    headers::add_version_headers,
    routes::{
        activity, asset_change, auth, billing, billing_operation, chain, check, configuration,
        configuration_operation, configuration_operation_owner, configuration_operation_signature,
        feedback, health, interpretation, interpretation_action, invite_code, notification,
        notification_settings, operation, owner, paymaster, paymaster_operation, portfolio,
        protocol, protocol_group, queue, signature, simulation, support_request, token,
        token_group, token_price, transaction, user, user_notification_settings, user_operation,
        user_operation_merkle, user_operation_merkle_proof, user_settings, wallet, wallet_billing,
        wallet_features, wallet_notification_settings, wallet_settings,
    },
    sessions::{self, authenticated},
};
use axum::{error_handling::HandleErrorLayer, middleware, routing::get, Router};
use axum_tracing_opentelemetry::middleware::{OtelAxumLayer, OtelInResponseLayer};
use eyre::Result;
use hyper::http::{
    header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE},
    HeaderValue, Method,
};
use lightdotso_opentelemetry::middleware::HttpMetricsLayerBuilder;
use lightdotso_state::{create_client_state, ClientState};
use lightdotso_tracing::tracing::info;
use std::{net::SocketAddr, sync::Arc, time::Duration};
use tokio::net::TcpListener;
use tower::ServiceBuilder;
use tower_cookies::{cookie::SameSite, CookieManagerLayer};
use tower_governor::{
    governor::GovernorConfigBuilder, key_extractor::SmartIpKeyExtractor, GovernorLayer,
};
use tower_http::cors::{AllowOrigin, CorsLayer};
use tower_sessions::SessionManagerLayer;
use utoipa::OpenApi;
use utoipa_axum::{router::OpenApiRouter, routes};
use utoipa_swagger_ui::SwaggerUi;

#[derive(OpenApi)]
#[openapi(info(
    title = "api.light.so",
    description = "API for api.light.so",
    contact(name = "support@light.so")
))]
#[openapi(
    tags(
        (name = "activity", description = "Activity API"),
        (name = "asset_change", description = "Asset Change API"),
        (name = "auth", description = "Auth API"),
        (name = "billing", description = "Billing API"),
        (name = "billing_operation", description = "Billing Operation API"),
        (name = "chain", description = "Chain API"),
        (name = "configuration", description = "Configuration API"),
        (name = "configuration_operation", description = "Configuration Operation API"),
        (name = "configuration_operation_owner", description = "Configuration Operation Owner API"),
        (name = "configuration_operation_signature", description = "Configuration Operation Signature API"),
        (name = "check", description = "Check API"),
        (name = "feedback", description = "Feedback API"),
        (name = "interpretation", description = "Interpretation API"),
        (name = "interpretation_action", description = "Interpretation Action API"),
        (name = "invite_code", description = "Invite Code API"),
        (name = "health", description = "Health API"),
        (name = "notification", description = "Notification API"),
        (name = "notification_settings", description = "Notification Settings API"),
        (name = "operation", description = "Operation API"),
        (name = "owner", description = "Owner API"),
        (name = "paymaster", description = "Paymaster API"),
        (name = "paymaster_operation", description = "Paymaster Operation API"),
        (name = "portfolio", description = "Portfolio API"),
        (name = "protocol", description = "Protocol API"),
        (name = "protocol_group", description = "Protocol Group API"),
        (name = "queue", description = "Queue API"),
        (name = "signature", description = "Signature API"),
        (name = "simulation", description = "Simulation API"),
        (name = "support_request", description = "Support Request API"),
        (name = "token", description = "Token API"),
        (name = "token_group", description = "Token Group API"),
        (name = "token_price", description = "Token Price API"),
        (name = "transaction", description = "Transaction API"),
        (name = "user", description = "User API"),
        (name = "user_notification_settings", description = "User Notification Settings API"),
        (name = "user_operation", description = "User Operation API"),
        (name = "user_operation_merkle", description = "User Operation Merkle API"),
        (name = "user_operation_merkle_proof", description = "User Operation Merkle Proof API"),
        (name = "user_settings", description = "User Settings API"),
        (name = "wallet", description = "Wallet API"),
        (name = "wallet_billing", description = "Wallet Billing API"),
        (name = "wallet_features", description = "Wallet Features API"),
        (name = "wallet_notification_settings", description = "Wallet Notification Settings API"),
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
    let state = create_client_state().await?;

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
            if let Ok(localhost_origin) = "http://localhost:6006".parse() {
                origins.push(localhost_origin);
            }
        }
    }
    let cors = CorsLayer::new()
        .allow_methods([
            Method::GET,
            Method::PUT,
            Method::POST,
            Method::PATCH,
            Method::DELETE,
            Method::OPTIONS,
        ])
        .allow_credentials(true)
        .allow_headers([AUTHORIZATION, ACCEPT, CONTENT_TYPE])
        .allow_origin(AllowOrigin::predicate(move |origin: &HeaderValue, _| {
            origin
                .to_str()
                .map(|origin_string| {
                    origin_string.ends_with("light.so") ||
                        origin_string.ends_with(".vercel.app") ||
                        origin_string.ends_with(".light.so") ||
                        origins.iter().any(|allowed_origin| {
                            allowed_origin.to_str().unwrap() == origin_string
                        })
                })
                .unwrap_or(false)
        }))
        .max_age(Duration::from_secs(86400));

    // Rate limit based on IP address
    // From: https://github.com/benwis/tower-governor
    // License: MIT
    let governor_conf = Arc::new(
        GovernorConfigBuilder::default()
            .per_millisecond(300)
            .burst_size(300)
            .use_headers()
            .key_extractor(SmartIpKeyExtractor)
            .finish()
            .unwrap(),
    );

    // Rate limit based on IP address but only for authenticated users
    let authenticated_governor_conf = Arc::new(
        GovernorConfigBuilder::default()
            .per_millisecond(100)
            .burst_size(1000)
            .use_headers()
            .key_extractor(SmartIpKeyExtractor)
            .finish()
            .unwrap(),
    );

    // Create the api doc
    let open_api_spec = ApiDoc::openapi();

    // Create the API
    let api = Router::new()
        .merge(activity::router())
        .merge(asset_change::router())
        .merge(auth::router())
        .merge(billing::router())
        .merge(billing_operation::router())
        .merge(chain::router())
        .merge(configuration::router())
        .merge(configuration_operation::router())
        .merge(configuration_operation_owner::router())
        .merge(configuration_operation_signature::router())
        .merge(check::router())
        .merge(feedback::router())
        .merge(health::router())
        .merge(interpretation::router())
        .merge(interpretation_action::router())
        .merge(invite_code::router())
        // .merge(metrics::router())
        .merge(notification::router())
        .merge(notification_settings::router())
        .merge(operation::router())
        .merge(owner::router())
        .merge(paymaster::router())
        .merge(paymaster_operation::router())
        .merge(portfolio::router())
        .merge(protocol::router())
        .merge(protocol_group::router())
        .merge(queue::router())
        .merge(signature::router())
        .merge(simulation::router())
        .merge(support_request::router())
        .merge(token::router())
        .merge(token_group::router())
        .merge(token_price::router())
        .merge(transaction::router())
        .merge(user::router())
        .merge(user_notification_settings::router())
        .merge(user_operation::router())
        .merge(user_operation_merkle::router())
        .merge(user_operation_merkle_proof::router())
        .merge(user_settings::router())
        .merge(wallet::router())
        .merge(wallet_billing::router())
        .merge(wallet_features::router())
        .merge(wallet_notification_settings::router())
        .merge(wallet_settings::router());

    // Create the open api router
    let open_api_router: OpenApiRouter<ClientState> = OpenApiRouter::new()
        .routes(routes!(activity::v1_activity_get_handler))
        .routes(routes!(activity::v1_activity_list_handler))
        .routes(routes!(activity::v1_activity_list_count_handler))
        .routes(routes!(asset_change::v1_asset_change_get_handler))
        .routes(routes!(asset_change::v1_asset_change_list_handler))
        .routes(routes!(auth::v1_auth_nonce_handler))
        .routes(routes!(auth::v1_auth_session_handler))
        .routes(routes!(auth::v1_auth_logout_handler))
        .routes(routes!(auth::v1_auth_verify_handler))
        .routes(routes!(billing::v1_billing_get_handler))
        .routes(routes!(billing::v1_billing_list_handler))
        .routes(routes!(billing::v1_billing_update_handler))
        .routes(routes!(billing_operation::v1_billing_operation_get_handler))
        .routes(routes!(billing_operation::v1_billing_operation_list_handler))
        .routes(routes!(billing_operation::v1_billing_operation_list_count_handler))
        .routes(routes!(check::handler))
        .routes(routes!(health::handler))
        .routes(routes!(chain::v1_chain_create_handler))
        .routes(routes!(chain::v1_chain_get_handler))
        .routes(routes!(chain::v1_chain_list_handler))
        .routes(routes!(chain::v1_chain_update_handler))
        .routes(routes!(configuration::v1_configuration_get_handler))
        .routes(routes!(configuration::v1_configuration_list_handler))
        .routes(routes!(configuration_operation::v1_configuration_operation_create_handler))
        .routes(routes!(configuration_operation::v1_configuration_operation_get_handler))
        .routes(routes!(configuration_operation::v1_configuration_operation_list_handler))
        .routes(routes!(configuration_operation::v1_configuration_operation_list_count_handler))
        .routes(routes!(configuration_operation::v1_configuration_operation_update_handler))
        .routes(routes!(
            configuration_operation_owner::v1_configuration_operation_owner_get_handler
        ))
        .routes(routes!(
            configuration_operation_owner::v1_configuration_operation_owner_list_handler
        ))
        .routes(routes!(
            configuration_operation_signature::v1_configuration_operation_signature_create_handler
        ))
        .routes(routes!(
            configuration_operation_signature::v1_configuration_operation_signature_get_handler
        ))
        .routes(routes!(
            configuration_operation_signature::v1_configuration_operation_signature_list_handler
        ))
        .routes(routes!(feedback::v1_feedback_create_handler))
        .routes(routes!(interpretation::v1_interpretation_get_handler))
        .routes(routes!(interpretation::v1_interpretation_list_handler))
        .routes(routes!(interpretation_action::v1_interpretation_action_get_handler))
        .routes(routes!(interpretation_action::v1_interpretation_action_list_handler))
        .routes(routes!(interpretation_action::v1_interpretation_action_list_count_handler))
        .routes(routes!(invite_code::v1_invite_code_create_handler))
        .routes(routes!(invite_code::v1_invite_code_get_handler))
        .routes(routes!(invite_code::v1_invite_code_list_handler))
        .routes(routes!(invite_code::v1_invite_code_list_count_handler))
        .routes(routes!(notification::v1_notification_get_handler))
        .routes(routes!(notification::v1_notification_list_handler))
        .routes(routes!(notification::v1_notification_list_count_handler))
        .routes(routes!(notification::v1_notification_read_handler))
        .routes(routes!(notification_settings::v1_notification_settings_get_handler))
        .routes(routes!(notification_settings::v1_notification_settings_list_handler))
        .routes(routes!(notification_settings::v1_notification_settings_list_count_handler))
        .routes(routes!(operation::v1_operation_list_handler))
        .routes(routes!(operation::v1_operation_list_count_handler))
        .routes(routes!(owner::v1_owner_get_handler))
        .routes(routes!(owner::v1_owner_list_handler))
        .routes(routes!(paymaster::v1_paymaster_get_handler))
        .routes(routes!(paymaster::v1_paymaster_list_handler))
        .routes(routes!(paymaster_operation::v1_paymaster_operation_get_handler))
        .routes(routes!(paymaster_operation::v1_paymaster_operation_list_handler))
        .routes(routes!(portfolio::v1_portfolio_get_handler))
        .routes(routes!(protocol::v1_protocol_get_handler))
        .routes(routes!(protocol::v1_protocol_list_handler))
        .routes(routes!(protocol_group::v1_protocol_group_create_handler))
        .routes(routes!(protocol_group::v1_protocol_group_get_handler))
        .routes(routes!(protocol_group::v1_protocol_group_list_handler))
        .routes(routes!(queue::v1_queue_interpretation_handler))
        .routes(routes!(queue::v1_queue_portfolio_handler))
        .routes(routes!(queue::v1_queue_node_handler))
        .routes(routes!(queue::v1_queue_token_handler))
        .routes(routes!(queue::v1_queue_transaction_handler))
        .routes(routes!(queue::v1_queue_user_operation_handler))
        .routes(routes!(signature::v1_signature_create_handler))
        .routes(routes!(signature::v1_signature_get_handler))
        .routes(routes!(signature::v1_signature_list_handler))
        .routes(routes!(simulation::v1_simulation_create_handler))
        .routes(routes!(simulation::v1_simulation_get_handler))
        .routes(routes!(simulation::v1_simulation_list_handler))
        .routes(routes!(simulation::v1_simulation_list_count_handler))
        .routes(routes!(support_request::v1_support_request_create_handler))
        .routes(routes!(token::v1_token_get_handler))
        .routes(routes!(token::v1_token_list_handler))
        .routes(routes!(token::v1_token_list_count_handler))
        .routes(routes!(token::v1_token_update_handler))
        .routes(routes!(token_group::v1_token_group_create_handler))
        .routes(routes!(token_group::v1_token_group_get_handler))
        .routes(routes!(token_group::v1_token_group_list_handler))
        .routes(routes!(token_price::v1_token_price_get_handler))
        .routes(routes!(transaction::v1_transaction_get_handler))
        .routes(routes!(transaction::v1_transaction_list_handler))
        .routes(routes!(transaction::v1_transaction_list_count_handler))
        .routes(routes!(user::v1_user_get_handler))
        .routes(routes!(user_notification_settings::v1_user_notification_settings_get_handler))
        .routes(routes!(user_notification_settings::v1_user_notification_settings_update_handler))
        .routes(routes!(user_operation::v1_user_operation_create_handler))
        .routes(routes!(user_operation::v1_user_operation_create_batch_handler))
        .routes(routes!(user_operation::v1_user_operation_get_handler))
        .routes(routes!(user_operation::v1_user_operation_nonce_handler))
        .routes(routes!(user_operation::v1_user_operation_list_handler))
        .routes(routes!(user_operation::v1_user_operation_list_count_handler))
        .routes(routes!(user_operation::v1_user_operation_signature_handler))
        .routes(routes!(user_operation::v1_user_operation_update_handler))
        .routes(routes!(user_operation_merkle::v1_user_operation_merkle_create_handler))
        .routes(routes!(user_operation_merkle::v1_user_operation_merkle_get_handler))
        .routes(routes!(user_operation_merkle::v1_user_operation_merkle_list_handler))
        .routes(routes!(user_operation_merkle_proof::v1_user_operation_merkle_proof_get_handler))
        .routes(routes!(user_operation_merkle_proof::v1_user_operation_merkle_proof_list_handler))
        .routes(routes!(user_settings::v1_user_settings_get_handler))
        .routes(routes!(user_settings::v1_user_settings_update_handler))
        .routes(routes!(wallet::v1_wallet_create_handler))
        .routes(routes!(wallet::v1_wallet_get_handler))
        .routes(routes!(wallet::v1_wallet_list_handler))
        .routes(routes!(wallet::v1_wallet_list_count_handler))
        .routes(routes!(wallet::v1_wallet_update_handler))
        .routes(routes!(wallet_billing::v1_wallet_billing_get_handler))
        .routes(routes!(wallet_billing::v1_wallet_billing_update_handler))
        .routes(routes!(wallet_features::v1_wallet_features_get_handler))
        .routes(routes!(wallet_features::v1_wallet_features_update_handler))
        .routes(routes!(wallet_notification_settings::v1_wallet_notification_settings_get_handler))
        .routes(routes!(
            wallet_notification_settings::v1_wallet_notification_settings_update_handler
        ))
        .routes(routes!(wallet_settings::v1_wallet_settings_get_handler))
        .routes(routes!(wallet_settings::v1_wallet_settings_update_handler))
        .with_state(state.clone());

    // Create the session store
    let session_store = sessions::RedisStore::new(state.clone().redis.clone().as_ref().clone());
    let mut session_manager_layer =
        SessionManagerLayer::new(session_store.clone()).with_name(*SESSION_COOKIE_ID);

    // If deployed under fly.io, `FLY_APP_NAME` starts w/ `lightdotso-api` then set the cookie
    // domain to `.light.so` and secure to true. Also set the same site to lax.
    if let Ok(fly_app_name) = std::env::var("FLY_APP_NAME") {
        if fly_app_name.starts_with("lightdotso-api") {
            session_manager_layer = session_manager_layer
                .with_domain(".light.so".to_string())
                .with_secure(true)
                .with_same_site(SameSite::Lax);
        }
    }

    // Create the concurrent limit layer
    let concurrency_layer =
        tower::ServiceBuilder::new().load_shed().concurrency_limit(10).into_inner();

    // Create the cookie manager
    let cookie_manager_layer = CookieManagerLayer::new();

    // Create the otlp middleware
    let metrics = HttpMetricsLayerBuilder::new()
        .with_service_name(
            std::env::var("FLY_APP_NAME").unwrap_or(env!("CARGO_PKG_NAME").to_string()),
        )
        .with_service_version(env!("CARGO_PKG_VERSION").to_string())
        .build();

    let (_router, open_api) = OpenApiRouter::with_openapi(open_api_spec)
        .nest("/v1", open_api_router.clone())
        .split_for_parts();

    // Create the app for the server
    let app = Router::new()
        .layer(
            ServiceBuilder::new()
                .layer(HandleErrorLayer::new(handle_error))
                .layer(cookie_manager_layer.clone())
                .layer(session_manager_layer.clone())
                .layer(concurrency_layer)
                .layer(metrics.clone())
                .layer(OtelInResponseLayer)
                .layer(OtelAxumLayer::default())
                .layer(cors.clone())
                .layer(middleware::from_fn(add_version_headers))
                .into_inner(),
        )
        .route("/", get("api.light.so"))
        .merge(api.clone())
        .merge(metrics.routes())
        .merge(SwaggerUi::new("/v1/swagger-ui").url("/api-docs/openapi.json", open_api.clone()))
        .layer(
            // Set up error handling, rate limiting, and CORS
            // From: https://github.com/MystenLabs/sui/blob/13df03f2fad0e80714b596f55b04e0b7cea37449/crates/sui-faucet/src/main.rs#L96C1-L105C19
            // License: Apache-2.0
            ServiceBuilder::new()
                // .layer(HandleErrorLayer::new(handle_error))
                .layer(GovernorLayer { config: governor_conf })
                .layer(cookie_manager_layer.clone())
                .layer(session_manager_layer.clone())
                // .layer(SetSensitiveRequestHeadersLayer::from_shared(Arc::clone(&headers)))
                .layer(metrics.clone())
                .layer(OtelInResponseLayer)
                .layer(OtelAxumLayer::default())
                .layer(cors.clone())
                .layer(middleware::from_fn(add_version_headers)),
        )
        .nest(
            "/authenticated/v1",
            api.clone().layer(
                ServiceBuilder::new()
                    // .layer(HandleErrorLayer::new(handle_error))
                    .layer(GovernorLayer { config: authenticated_governor_conf })
                    .layer(cookie_manager_layer.clone())
                    .layer(session_manager_layer.clone())
                    .layer(middleware::from_fn(authenticated))
                    .layer(metrics.clone())
                    .layer(OtelInResponseLayer)
                    .layer(OtelAxumLayer::default())
                    .layer(cors.clone())
                    .layer(middleware::from_fn(add_version_headers)),
            ),
        )
        .nest(
            "/admin/v1",
            api.clone().layer(
                ServiceBuilder::new()
                    .layer(cookie_manager_layer.clone())
                    .layer(session_manager_layer.clone())
                    .layer(middleware::from_fn(admin))
                    .layer(metrics.clone())
                    .layer(OtelInResponseLayer)
                    .layer(OtelAxumLayer::default())
                    .layer(middleware::from_fn(add_version_headers)),
            ),
        )
        .layer(
            ServiceBuilder::new()
                .layer(cors)
                .layer(middleware::from_fn(add_version_headers))
                .into_inner(),
        )
        .with_state(state);

    let socket_addr = "[::]:3000";
    let listener = TcpListener::bind(socket_addr).await?;
    axum::serve(listener, app.into_make_service_with_connect_info::<SocketAddr>()).await?;

    Ok(())
}
