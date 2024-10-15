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
    state::AppState,
};
use axum::{error_handling::HandleErrorLayer, middleware, routing::get, Router};
use axum_tracing_opentelemetry::middleware::{OtelAxumLayer, OtelInResponseLayer};
use eyre::Result;
use hyper::http::{
    header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE},
    HeaderValue, Method,
};
use lightdotso_db::db::create_client;
use lightdotso_hyper::get_hyper_client;
use lightdotso_kafka::get_producer;
use lightdotso_opentelemetry::middleware::HttpMetricsLayerBuilder;
use lightdotso_redis::get_redis_client;
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
        schemas(activity::list::ActivityListCount),
        schemas(activity::types::Activity),
        schemas(asset_change::error::AssetChangeError),
        schemas(asset_change::types::AssetChange),
        schemas(auth::error::AuthError),
        schemas(auth::nonce::AuthNonce),
        schemas(auth::session::AuthSession),
        schemas(auth::types::AuthSuccess),
        schemas(auth::verify::AuthVerifyCreateRequestParams),
        schemas(billing::error::BillingError),
        schemas(billing::types::Billing),
        schemas(billing::update::BillingQueryStatus),
        schemas(billing::update::BillingUpdateRequestParams),
        schemas(billing_operation::error::BillingOperationError),
        schemas(billing_operation::list::BillingOperationListCount),
        schemas(billing_operation::types::BillingOperation),
        schemas(chain::error::ChainError),
        schemas(chain::types::Chain),
        schemas(chain::update::ChainUpdateRequestParams),
        schemas(configuration::error::ConfigurationError),
        schemas(configuration::types::Configuration),
        schemas(configuration::types::ConfigurationOperationOwner),
        schemas(configuration_operation::create::ConfigurationOperationCreateOwnerParams),
        schemas(configuration_operation::create::ConfigurationOperationCreateRequestParams),
        schemas(configuration_operation::create::ConfigurationOperationSignatureCreateParams),
        schemas(configuration_operation::error::ConfigurationOperationError),
        schemas(configuration_operation::list::ConfigurationOperationListCount),
        schemas(configuration_operation::types::ConfigurationOperation),
        schemas(configuration_operation_owner::error::ConfigurationOperationOwnerError),
        schemas(configuration_operation_owner::types::ConfigurationOperationOwner),
        schemas(configuration_operation_signature::create::ConfigurationOperationSignatureSignatureCreateParams),
        schemas(configuration_operation_signature::create::ConfigurationOperationSignatureCreateRequestParams),
        schemas(configuration_operation_signature::error::ConfigurationOperationSignatureError),
        schemas(configuration_operation_signature::types::ConfigurationOperationSignature),
        schemas(feedback::create::FeedbackCreateRequestParams),
        schemas(feedback::error::FeedbackError),
        schemas(feedback::types::Feedback),
        schemas(interpretation::error::InterpretationError),
        schemas(interpretation::types::Interpretation),
        schemas(interpretation_action::error::InterpretationActionError),
        schemas(interpretation_action::list::InterpretationActionListCount),
        schemas(interpretation_action::types::InterpretationAction),
        schemas(invite_code::error::InviteCodeError),
        schemas(invite_code::list::InviteCodeListCount),
        schemas(invite_code::types::InviteCode),
        schemas(notification::error::NotificationError),
        schemas(notification::list::NotificationListCount),
        schemas(notification::read::NotificationReadParams),
        schemas(notification::read::NotificationReadRequestParams),
        schemas(notification::types::Notification),
        schemas(notification_settings::error::NotificationSettingsError),
        schemas(notification_settings::list::NotificationSettingsListCount),
        schemas(notification_settings::types::NotificationSettings),
        schemas(notification_settings::types::NotificationSettingsUpdate),
        schemas(operation::error::OperationError),
        schemas(operation::list::OperationListCount),
        schemas(operation::types::Operation),
        schemas(owner::error::OwnerError),
        schemas(owner::types::Owner),
        schemas(paymaster::error::PaymasterError),
        schemas(paymaster::types::Paymaster),
        schemas(paymaster_operation::error::PaymasterOperationError),
        schemas(paymaster_operation::types::PaymasterOperation),
        schemas(portfolio::error::PortfolioError),
        schemas(portfolio::types::Portfolio),
        schemas(portfolio::types::PortfolioBalanceDate),
        schemas(protocol::error::ProtocolError),
        schemas(protocol::types::Protocol),
        schemas(protocol_group::error::ProtocolGroupError),
        schemas(protocol_group::types::ProtocolGroup),
        schemas(queue::error::QueueError),
        schemas(queue::types::QueueSuccess),
        schemas(signature::create::SignatureCreateParams),
        schemas(signature::create::SignatureCreateRequestParams),
        schemas(signature::error::SignatureError),
        schemas(signature::types::Signature),
        schemas(simulation::create::SimulationCreateRequestParams),
        schemas(simulation::list::SimulationListCount),
        schemas(simulation::error::SimulationError),
        schemas(simulation::types::Simulation),
        schemas(support_request::error::SupportRequestError),
        schemas(support_request::types::SupportRequest),
        schemas(support_request::create::SupportRequestCreateRequestParams),
        schemas(token::error::TokenError),
        schemas(token::list::TokenListCount),
        schemas(token::types::Token),
        schemas(token::types::TokenGroup),
        schemas(token::update::TokenUpdateRequestParams),
        schemas(token_group::error::TokenGroupError),
        schemas(token_price::error::TokenPriceError),
        schemas(transaction::error::TransactionError),
        schemas(transaction::list::TransactionListCount),
        schemas(token_group::types::TokenGroup),
        schemas(token_price::types::TokenPrice),
        schemas(token_price::types::TokenPriceDate),
        schemas(transaction::types::Transaction),
        schemas(user::error::UserError),
        schemas(user::types::User),
        schemas(user_notification_settings::error::UserNotificationSettingsError),
        schemas(user_notification_settings::types::UserNotificationSettings),
        schemas(user_notification_settings::types::UserNotificationSettingsOptional),
        schemas(user_notification_settings::update::UserNotificationSettingsUpdateRequestParams),
        schemas(user_operation::create::UserOperationCreateParams),
        schemas(user_operation::create::UserOperationCreateBatchRequestParams),
        schemas(user_operation::create::UserOperationCreateRequestParams),
        schemas(user_operation::error::UserOperationError),
        schemas(user_operation::list::UserOperationListCount),
        schemas(user_operation::nonce::UserOperationNonce),
        schemas(user_operation::types::UserOperation),
        schemas(user_operation::types::UserOperationSuccess),
        schemas(user_operation_merkle::error::UserOperationMerkleError),
        schemas(user_operation_merkle::types::UserOperationMerkle),
        schemas(user_operation_merkle_proof::error::UserOperationMerkleProofError),
        schemas(user_operation_merkle_proof::types::UserOperationMerkleProof),
        schemas(user_settings::error::UserSettingsError),
        schemas(user_settings::types::UserSettings),
        schemas(user_settings::types::UserSettingsOptional),
        schemas(user_settings::update::UserSettingsUpdateRequestParams),
        schemas(wallet::create::WalletCreateOwnerParams),
        schemas(wallet::create::WalletCreateRequestParams),
        schemas(wallet::error::WalletError),
        schemas(wallet::list::WalletListCount),
        schemas(wallet::types::Wallet),
        schemas(wallet::update::WalletUpdateRequestParams),
        schemas(wallet_billing::error::WalletBillingError),
        schemas(wallet_billing::types::WalletBilling),
        schemas(wallet_billing::types::WalletBillingOptional),
        schemas(wallet_billing::update::WalletBillingUpdateRequestParams),
        schemas(wallet_features::error::WalletFeaturesError),
        schemas(wallet_features::types::WalletFeatures),
        schemas(wallet_features::types::WalletFeaturesOptional),
        schemas(wallet_features::update::WalletFeaturesUpdateRequestParams),
        schemas(wallet_notification_settings::error::WalletNotificationSettingsError),
        schemas(wallet_notification_settings::types::WalletNotificationSettings),
        schemas(wallet_notification_settings::types::WalletNotificationSettingsOptional),
        schemas(wallet_notification_settings::update::WalletNotificationSettingsUpdateRequestParams),
        schemas(wallet_settings::error::WalletSettingsError),
        schemas(wallet_settings::types::WalletSettings),
        schemas(wallet_settings::types::WalletSettingsOptional),
        schemas(wallet_settings::update::WalletSettingsUpdateRequestParams),
    ),
    paths(
        activity::v1_activity_get_handler,
        activity::v1_activity_list_handler,
        activity::v1_activity_list_count_handler,
        asset_change::v1_asset_change_get_handler,
        asset_change::v1_asset_change_list_handler,
        auth::v1_auth_nonce_handler,
        auth::v1_auth_session_handler,
        auth::v1_auth_logout_handler,
        auth::v1_auth_verify_handler,
        billing::v1_billing_get_handler,
        billing::v1_billing_list_handler,
        billing::v1_billing_update_handler,
        billing_operation::v1_billing_operation_get_handler,
        billing_operation::v1_billing_operation_list_handler,
        billing_operation::v1_billing_operation_list_count_handler,
        check::handler,
        health::handler,
        chain::v1_chain_create_handler,
        chain::v1_chain_get_handler,
        chain::v1_chain_list_handler,
        chain::v1_chain_update_handler,
        configuration::v1_configuration_get_handler,
        configuration::v1_configuration_list_handler,
        configuration_operation::v1_configuration_operation_create_handler,
        configuration_operation::v1_configuration_operation_get_handler,
        configuration_operation::v1_configuration_operation_list_handler,
        configuration_operation::v1_configuration_operation_list_count_handler,
        configuration_operation::v1_configuration_operation_update_handler,
        configuration_operation_owner::v1_configuration_operation_owner_get_handler,
        configuration_operation_owner::v1_configuration_operation_owner_list_handler,
        configuration_operation_signature::v1_configuration_operation_signature_create_handler,
        configuration_operation_signature::v1_configuration_operation_signature_get_handler,
        configuration_operation_signature::v1_configuration_operation_signature_list_handler,
        feedback::v1_feedback_create_handler,
        interpretation::v1_interpretation_get_handler,
        interpretation::v1_interpretation_list_handler,
        interpretation_action::v1_interpretation_action_get_handler,
        interpretation_action::v1_interpretation_action_list_handler,
        interpretation_action::v1_interpretation_action_list_count_handler,
        invite_code::v1_invite_code_create_handler,
        invite_code::v1_invite_code_get_handler,
        invite_code::v1_invite_code_list_handler,
        invite_code::v1_invite_code_list_count_handler,
        notification::v1_notification_get_handler,
        notification::v1_notification_list_handler,
        notification::v1_notification_list_count_handler,
        notification::v1_notification_read_handler,
        notification_settings::v1_notification_settings_get_handler,
        notification_settings::v1_notification_settings_list_handler,
        notification_settings::v1_notification_settings_list_count_handler,
        operation::v1_operation_list_handler,
        operation::v1_operation_list_count_handler,
        owner::v1_owner_get_handler,
        owner::v1_owner_list_handler,
        paymaster::v1_paymaster_get_handler,
        paymaster::v1_paymaster_list_handler,
        paymaster_operation::v1_paymaster_operation_get_handler,
        paymaster_operation::v1_paymaster_operation_list_handler,
        portfolio::v1_portfolio_get_handler,
        protocol::v1_protocol_get_handler,
        protocol::v1_protocol_list_handler,
        protocol_group::v1_protocol_group_create_handler,
        protocol_group::v1_protocol_group_get_handler,
        protocol_group::v1_protocol_group_list_handler,
        queue::v1_queue_interpretation_handler,
        queue::v1_queue_portfolio_handler,
        queue::v1_queue_node_handler,
        queue::v1_queue_token_handler,
        queue::v1_queue_transaction_handler,
        queue::v1_queue_user_operation_handler,
        signature::v1_signature_create_handler,
        signature::v1_signature_get_handler,
        signature::v1_signature_list_handler,
        simulation::v1_simulation_create_handler,
        simulation::v1_simulation_get_handler,
        simulation::v1_simulation_list_handler,
        simulation::v1_simulation_list_count_handler,
        support_request::v1_support_request_create_handler,
        token::v1_token_get_handler,
        token::v1_token_list_handler,
        token::v1_token_list_count_handler,
        token::v1_token_update_handler,
        token_group::v1_token_group_create_handler,
        token_group::v1_token_group_get_handler,
        token_group::v1_token_group_list_handler,
        token_price::v1_token_price_get_handler,
        transaction::v1_transaction_get_handler,
        transaction::v1_transaction_list_handler,
        transaction::v1_transaction_list_count_handler,
        user::v1_user_get_handler,
        user_notification_settings::v1_user_notification_settings_get_handler,
        user_notification_settings::v1_user_notification_settings_update_handler,
        user_operation::v1_user_operation_create_handler,
        user_operation::v1_user_operation_create_batch_handler,
        user_operation::v1_user_operation_get_handler,
        user_operation::v1_user_operation_nonce_handler,
        user_operation::v1_user_operation_list_handler,
        user_operation::v1_user_operation_list_count_handler,
        user_operation::v1_user_operation_signature_handler,
        user_operation::v1_user_operation_update_handler,
        user_operation_merkle::v1_user_operation_merkle_create_handler,
        user_operation_merkle::v1_user_operation_merkle_get_handler,
        user_operation_merkle::v1_user_operation_merkle_list_handler,
        user_operation_merkle_proof::v1_user_operation_merkle_proof_get_handler,
        user_operation_merkle_proof::v1_user_operation_merkle_proof_list_handler,
        user_settings::v1_user_settings_get_handler,
        user_settings::v1_user_settings_update_handler,
        wallet::v1_wallet_create_handler,
        wallet::v1_wallet_get_handler,
        wallet::v1_wallet_list_handler,
        wallet::v1_wallet_list_count_handler,
        wallet::v1_wallet_update_handler,
        wallet_billing::v1_wallet_billing_get_handler,
        wallet_billing::v1_wallet_billing_update_handler,
        wallet_features::v1_wallet_features_get_handler,
        wallet_features::v1_wallet_features_update_handler,
        wallet_notification_settings::v1_wallet_notification_settings_get_handler,
        wallet_notification_settings::v1_wallet_notification_settings_update_handler,
        wallet_settings::v1_wallet_settings_get_handler,
        wallet_settings::v1_wallet_settings_update_handler,
    ),
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
    let hyper = get_hyper_client()?;
    let db = Arc::new(create_client().await?);
    let producer = Arc::new(get_producer()?);
    let redis = get_redis_client()?;
    let state =
        AppState { hyper: Arc::new(hyper), client: db, producer, redis: Arc::new(redis.clone()) };

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

    // Create the session store
    let session_store = sessions::RedisStore::new(redis);
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

    // Create the api doc
    let mut open_api = ApiDoc::openapi();
    let components = open_api.components.get_or_insert(Components::new());
    components.add_security_scheme(
        "sid",
        SecurityScheme::ApiKey(ApiKey::Cookie(ApiKeyValue::new(&**SESSION_COOKIE_ID))),
    );

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
