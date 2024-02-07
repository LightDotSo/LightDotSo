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
