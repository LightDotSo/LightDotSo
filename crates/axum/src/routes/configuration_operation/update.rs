// Copyright 2023-2024 Light, Inc.
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

#![allow(clippy::unwrap_used)]

use crate::{
    error::RouteError,
    result::AppJsonResult,
    routes::{
        configuration_operation::types::ConfigurationOperation,
        configuration_signature::error::ConfigurationSignatureError,
    },
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use eyre::Result;
use lightdotso_db::models::activity::CustomParams;
use lightdotso_kafka::{
    topics::activity::produce_activity_message, types::activity::ActivityMessage,
};
use lightdotso_prisma::{
    configuration, configuration_operation, configuration_owner, configuration_signature, owner,
    ActivityEntity, ActivityOperation, ConfigurationOperationStatus,
};
use lightdotso_tracing::tracing::info;
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct PutQuery {
    /// The operation of the configuration.
    pub configuration_operation_id: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Create a configuration signature
#[utoipa::path(
        put,
        path = "/configuration_operation/update",
        params(
            PutQuery
        ),
        responses(
            (status = 200, description = "Configuration operation updated successfully", body = ConfigurationOperation),
            (status = 400, description = "Invalid Configuration", body = SignatureError),
            (status = 500, description = "Configuration operation internal error", body = SignatureError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_configuration_operation_update_handler(
    put_query: Query<PutQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<ConfigurationOperation> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the post query.
    let Query(query) = put_query;

    // Get the chain id from the post query.
    let configuration_operation_id = query.configuration_operation_id;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the configuration operation from the database.
    let configuration_operation = state
        .client
        .configuration_operation()
        .find_unique(configuration_operation::id::equals(configuration_operation_id))
        .with(configuration_operation::wallet::fetch())
        .with(
            configuration_operation::configuration_signatures::fetch(vec![])
                .with(configuration_signature::configuration_owner::fetch()),
        )
        .with(
            configuration_operation::configuration_owners::fetch(vec![])
                .with(configuration_owner::user::fetch()),
        )
        .exec()
        .await?;

    // If the user operation is not found, return a 404.
    let configuration_operation =
        configuration_operation.ok_or(RouteError::ConfigurationSignatureError(
            ConfigurationSignatureError::NotFound("User operation not found".to_string()),
        ))?;

    // Get the wallet from the database.
    let wallet =
        configuration_operation.clone().wallet.ok_or(RouteError::ConfigurationSignatureError(
            ConfigurationSignatureError::NotFound("Wallet not found".to_string()),
        ))?;

    // Get the configuration signatures from the database.
    let configuration_signatures = configuration_operation.clone().configuration_signatures.ok_or(
        RouteError::ConfigurationSignatureError(ConfigurationSignatureError::NotFound(
            "Configuration signatures not found".to_string(),
        )),
    )?;

    // Get the configuration owners from the database.
    let owners = configuration_operation.clone().configuration_owners.ok_or(
        RouteError::ConfigurationSignatureError(ConfigurationSignatureError::NotFound(
            "Configuration owners not found".to_string(),
        )),
    )?;

    // -------------------------------------------------------------------------
    // Kafka
    // -------------------------------------------------------------------------

    // Get the culmulative weight of the existing signatures.
    let culmulative_weight:i64 =
        // Unwrap is safe because we are fetching the configuration_owner.
        configuration_signatures.iter().map(|sig| sig.configuration_owner.as_ref().unwrap().weight).sum();

    // If the culmulative weight is greater than the threshold, update the configuration operation.
    if culmulative_weight >= configuration_operation.threshold {
        // Update the configuration operation.
        let configuration_operation = state
            .client
            .configuration_operation()
            .update(
                configuration_operation::id::equals(configuration_operation.id.clone()),
                vec![configuration_operation::status::set(ConfigurationOperationStatus::Confirmed)],
            )
            .exec()
            .await?;
        info!(?configuration_operation);

        // ---------------------------------------------------------------------
        // Kafka
        // ---------------------------------------------------------------------

        // Produce an activity message.
        let _ = produce_activity_message(
            state.producer.clone(),
            ActivityEntity::ConfigurationOperation,
            &ActivityMessage {
                operation: ActivityOperation::Update,
                log: serde_json::to_value(&configuration_operation.clone())?,
                params: CustomParams {
                    configuration_operation_id: Some(configuration_operation.clone().id.clone()),
                    wallet_address: Some(wallet.address.clone()),
                    ..Default::default()
                },
            },
        )
        .await;

        // ---------------------------------------------------------------------
        // DB
        // ---------------------------------------------------------------------

        // Create a new configuration w/ the same contents as the configuration operation.
        let configuration: Result<configuration::Data> = state
            .client
            ._transaction()
            .run(|client| async move {
                // Create the configuration to the database.
                let configuration_data = client
                    .configuration()
                    .create(
                        configuration_operation.clone().address,
                        configuration_operation.clone().checkpoint,
                        configuration_operation.clone().image_hash,
                        configuration_operation.clone().threshold,
                        vec![],
                    )
                    .exec()
                    .await?;
                info!(?configuration_data);

                // Create the owners to the database.
                let owner_data = client
                    .owner()
                    .create_many(
                        owners
                            .iter()
                            .enumerate()
                            .map(|(_index, owner)| {
                                owner::create_unchecked(
                                    owner.clone().address,
                                    owner.clone().weight,
                                    owner.clone().index,
                                    configuration_data.clone().id,
                                    vec![owner::user_id::set(Some(
                                        owner
                                            .clone()
                                            .user
                                            .as_ref()
                                            .unwrap()
                                            .as_ref()
                                            .unwrap()
                                            .id
                                            .clone(),
                                    ))],
                                )
                            })
                            .collect(),
                    )
                    .exec()
                    .await?;
                info!(?owner_data);

                Ok(configuration_data)
            })
            .await;
        info!(?configuration);
    }

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the signatures to the format that the API expects.
    let configuration_operation: ConfigurationOperation = configuration_operation.into();

    Ok(Json::from(configuration_operation))
}
