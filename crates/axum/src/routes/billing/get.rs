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

use super::types::Billing;
use crate::{
    error::RouteError, result::AppJsonResult, routes::billing::error::BillingError, state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::billing;
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

/// Get a billing
///
/// Gets a billing by id.
#[utoipa::path(
        get,
        path = "/billing/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Billing returned successfully", body = Billing),
            (status = 404, description = "Billing not found", body = BillingError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_billing_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<Billing> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = get_query;

    info!("Get billing for address: {:?}", query);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the billings from the database.
    let billing = state.client.billing().find_unique(billing::id::equals(query.id)).exec().await?;

    // If the billing is not found, return a 404.
    let billing = billing
        .ok_or(RouteError::BillingError(BillingError::NotFound("Billing not found".to_string())))?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the billing to the format that the API expects.
    let billing: Billing = billing.into();

    Ok(Json::from(billing))
}
