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

use super::{error::PaymasterError, types::Paymaster};
use crate::{error::RouteError, result::AppJsonResult, tags::PAYMASTER_TAG};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::paymaster;
use lightdotso_state::ClientState;
use lightdotso_tracing::tracing::info;
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    pub id: String,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Get a paymaster
///
/// Gets a paymaster by id.
#[utoipa::path(
        get,
        path = "/paymaster/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Paymaster returned successfully", body = Paymaster),
            (status = 404, description = "Paymaster not found", body = PaymasterError),
        ),
        tag = PAYMASTER_TAG.as_str()
    )]
#[autometrics]
pub(crate) async fn v1_paymaster_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<ClientState>,
) -> AppJsonResult<Paymaster> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = get_query;

    info!("Get paymaster for address: {:?}", query);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the paymasters from the database.
    let paymaster =
        state.client.paymaster().find_unique(paymaster::id::equals(query.id)).exec().await?;

    // If the paymaster is not found, return a 404.
    let paymaster = paymaster.ok_or(RouteError::PaymasterError(PaymasterError::NotFound(
        "Paymaster not found".to_string(),
    )))?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the paymaster to the format that the API expects.
    let paymaster: Paymaster = paymaster.into();

    Ok(Json::from(paymaster))
}
