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

use crate::{result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::{extract::State, Json};
use clap::Parser;
use lightdotso_db::models::{
    activity::CustomParams, interpretation::upsert_interpretation_with_actions,
};
use lightdotso_interpreter::config::InterpreterArgs;
use lightdotso_kafka::{
    topics::activity::produce_activity_message, types::activity::ActivityMessage,
};
use lightdotso_prisma::{ActivityEntity, ActivityOperation};
use lightdotso_simulator::types::SimulationRequest;
use lightdotso_tracing::tracing::info;
// use lightdotso_tracing::tracing::info;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Params
// -----------------------------------------------------------------------------

#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct SimulationCreateRequestParams {
    /// The block number of the simulation to update for.
    /// If not provided, the latest block number will be used.
    pub block_number: Option<u64>,
    /// The chain id of the simulation to update for.
    pub chain_id: u64,
    /// The from address of the simulation to update for.
    pub from: String,
    /// The to address of the simulation to update for.
    pub to: String,
    /// The data of the simulation to update for.
    pub data: Option<String>,
    /// The value of the simulation to update for.
    pub value: Option<u64>,
}

// -----------------------------------------------------------------------------
// Try From
// -----------------------------------------------------------------------------

impl TryFrom<SimulationCreateRequestParams> for SimulationRequest {
    type Error = eyre::Report;

    fn try_from(params: SimulationCreateRequestParams) -> Result<Self, Self::Error> {
        Ok(Self {
            block_number: params.block_number,
            chain_id: params.chain_id,
            from: params.from.parse()?,
            to: params.to.parse()?,
            data: params.data.map(|data| data.parse()).transpose()?,
            value: params.value,
            gas_limit: u64::MAX,
        })
    }
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Create a simulation.
#[utoipa::path(
        post,
        path = "/simulation/create",
        request_body = SimulationCreateRequestParams,
        responses(
            (status = 200, description = "Simulation created successfully", body = i64),
            (status = 500, description = "Simulation internal error", body = SimulationError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_simulation_create_handler(
    State(state): State<AppState>,
    Json(params): Json<SimulationCreateRequestParams>,
) -> AppJsonResult<i64> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the simulation from the post body.
    let simulation_request = SimulationRequest::try_from(params.clone())?;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Create the simulation the database.
    let args = InterpreterArgs::parse_from([""]);

    // Run the simulation.
    let res = args.run(simulation_request).await?;
    info!("res: {:?}", res);

    // Upsert the interpretation
    upsert_interpretation_with_actions(state.client.clone(), res.clone(), None, None).await?;

    // -------------------------------------------------------------------------
    // Kafka
    // -------------------------------------------------------------------------

    // Produce an activity message.
    produce_activity_message(
        state.producer.clone(),
        ActivityEntity::Simulation,
        &ActivityMessage {
            operation: ActivityOperation::Create,
            log: serde_json::to_value(&params)?,
            params: CustomParams {
                // wallet_address: Some(wallet.address.clone()),
                // invite_code_id: Some(invite_code.id.clone()),
                ..Default::default()
            },
        },
    )
    .await?;

    Ok(Json::from(1))
}
