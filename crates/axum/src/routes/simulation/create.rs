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
    error::RouteError,
    result::AppJsonResult,
    routes::simulation::{error::SimulationError, types::Simulation},
    state::AppState,
};
use autometrics::autometrics;
use axum::{extract::State, Json};
use clap::Parser;
use ethers_main::utils::to_checksum;
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
            wallet::address::equals(to_checksum(&simulation_request_op.sender, None)),
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
                    or![interpretation_action::address::equals(to_checksum(
                        &simulation_request_op.sender,
                        None
                    ))],
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
