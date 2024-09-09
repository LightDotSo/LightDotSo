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

use crate::{
    error::RouteError,
    result::AppJsonResult,
    routes::simulation::{error::SimulationError, types::Simulation},
    state::AppState,
};
use autometrics::autometrics;
use axum::{extract::State, Json};
use clap::Parser;
use lightdotso_common::utils::hex_to_bytes;
use lightdotso_db::models::{
    activity::CustomParams, interpretation::upsert_interpretation_with_actions,
};
use lightdotso_interpreter::config::InterpreterArgs;
use lightdotso_kafka::{
    topics::activity::produce_activity_message, types::activity::ActivityMessage,
};
use lightdotso_prisma::{
    asset_change, interpretation, interpretation_action, simulation, wallet, ActivityEntity,
    ActivityOperation,
};
use lightdotso_simulator::types::{SimulationRequest, SimulationUserOperationRequest};
use lightdotso_tracing::tracing::info;
use prisma_client_rust::or;
// use lightdotso_tracing::tracing::info;
use serde::{Deserialize, Serialize};
use serde_json::json;
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Params
// -----------------------------------------------------------------------------

#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct SimulationCreateRequestParams {
    /// The chain id of the simulation to update for.
    pub chain_id: u64,
    /// The from address of the simulation to update for.
    pub sender: String,
    /// The nonce of the simulation to update for.
    pub nonce: u64,
    /// The init code of the simulation to update for.
    pub init_code: String,
    /// The call data of the simulation to update for.
    pub call_data: String,
}

// -----------------------------------------------------------------------------
// Try From
// -----------------------------------------------------------------------------

impl TryFrom<SimulationCreateRequestParams> for SimulationUserOperationRequest {
    type Error = eyre::Report;

    fn try_from(params: SimulationCreateRequestParams) -> Result<Self, Self::Error> {
        Ok(Self {
            chain_id: params.chain_id,
            sender: params.sender.parse()?,
            nonce: params.nonce,
            init_code: Some(hex_to_bytes(&params.init_code).unwrap_or_default().into()),
            call_data: Some(hex_to_bytes(&params.call_data).unwrap_or_default().into()),
        })
    }
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Create a simulation
#[utoipa::path(
        post,
        path = "/simulation/create",
        request_body = SimulationCreateRequestParams,
        responses(
            (status = 200, description = "Simulation created successfully", body = Simulation),
            (status = 500, description = "Simulation internal error", body = SimulationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_simulation_create_handler(
    State(state): State<AppState>,
    Json(params): Json<SimulationCreateRequestParams>,
) -> AppJsonResult<Simulation> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the simulation from the post body.
    let simulation_request_op = SimulationUserOperationRequest::try_from(params.clone())?;

    // Convert the simulation to a vector of simulation requests.
    let simulation_requests: Vec<SimulationRequest> =
        Vec::<SimulationRequest>::try_from(simulation_request_op.clone())?;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Create the simulation the database.
    let args = InterpreterArgs::parse_from([""]);

    // Run the simulation.
    let res = args.run(simulation_requests.clone()).await?;
    info!("res: {:?}", res);

    // Upsert the interpretation
    let interpretation =
        upsert_interpretation_with_actions(state.client.clone(), res.clone(), None, None).await?;
    info!(?interpretation);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Create the simulation the database.
    let simulation = state
        .client
        .simulation()
        .create(
            res.block_number as i32,
            res.gas_used as i64,
            res.success,
            json!({}),
            simulation_request_op.nonce as i64,
            simulation_request_op.init_code.unwrap_or_default().to_vec(),
            simulation_request_op.call_data.unwrap_or_default().to_vec(),
            interpretation::id::equals(interpretation.id.clone()),
            wallet::address::equals(simulation_request_op.sender.to_checksum(None)),
            vec![],
        )
        .exec()
        .await?;

    // Get the simulation from the database.
    let simulation = state
        .client
        .simulation()
        .find_unique(simulation::id::equals(simulation.id.clone()))
        .with(
            simulation::interpretation::fetch()
                .with(interpretation::actions::fetch(vec![
                    or![interpretation_action::address::equals("".to_string())],
                    or![interpretation_action::address::equals(
                        simulation_request_op.sender.to_checksum(None),
                    )],
                ]))
                .with(
                    interpretation::asset_changes::fetch(vec![])
                        .with(asset_change::interpretation_action::fetch())
                        .with(asset_change::token::fetch()),
                ),
        )
        .exec()
        .await?;

    // If the simulation is not found, return a 404.
    let simulation = simulation.ok_or(RouteError::SimulationError(SimulationError::NotFound(
        "Simulation not found".to_string(),
    )))?;

    // -------------------------------------------------------------------------
    // Kafka
    // -------------------------------------------------------------------------

    // Produce an activity message.
    let _ = produce_activity_message(
        state.producer.clone(),
        ActivityEntity::Simulation,
        &ActivityMessage {
            operation: ActivityOperation::Create,
            log: serde_json::to_value(&params)?,
            params: CustomParams {
                wallet_address: Some(simulation.sender.clone()),
                ..Default::default()
            },
        },
    )
    .await;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the simulation to the format that the API expects.
    let simulation: Simulation = simulation.into();

    Ok(Json::from(simulation))
}
