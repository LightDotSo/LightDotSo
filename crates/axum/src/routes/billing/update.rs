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
    constants::KAKI_USER_ID,
    error::RouteError,
    result::AppJsonResult,
    routes::billing::{error::BillingError, types::Billing},
    sessions::get_user_id,
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::{billing, BillingStatus};
use lightdotso_tracing::tracing::info;
use serde::Deserialize;
use tower_sessions_core::Session;
use utoipa::{IntoParams, ToSchema};

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct PutQuery {
    /// The id of the billing id to post for.
    billing_id: String,
}

// -----------------------------------------------------------------------------
// Params
// -----------------------------------------------------------------------------

#[derive(Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub struct BillingUpdateRequestParams {
    /// The balance USD of the wallet.
    pub balance_usd: Option<f64>,
    /// The status of the wallet.
    #[schema(example = "", default = "USER")]
    pub status: Option<BillingQueryStatus>,
}

#[derive(Clone, Debug, Deserialize, ToSchema)]
#[serde(rename_all = "snake_case")]
pub enum BillingQueryStatus {
    Sponsored,
    User,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Update a billing
#[utoipa::path(
        put,
        path = "/billing/update",
        params(
            PutQuery
        ),
        request_body = BillingUpdateRequestParams,
        responses(
            (status = 200, description = "Billing updated successfully", body = Billing),
            (status = 500, description = "Billing internal error", body = BillingError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_billing_update_handler(
    State(state): State<AppState>,
    mut session: Session,
    put_query: Query<PutQuery>,
    Json(params): Json<BillingUpdateRequestParams>,
) -> AppJsonResult<Billing> {
    // -------------------------------------------------------------------------
    // Session
    // -------------------------------------------------------------------------

    // Get the authenticated user id.
    let auth_user_id = get_user_id(&mut session)?;
    info!(?auth_user_id);

    // -------------------------------------------------------------------------
    // Authorization
    // -------------------------------------------------------------------------

    // If the authenticated user id is not `KAKI_USER_ID`, return an error.
    if auth_user_id != KAKI_USER_ID.to_string() {
        return Err(RouteError::BillingError(BillingError::Unauthorized(format!(
            "Not authorized for {}",
            auth_user_id
        )))
        .into());
    }

    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the put query.
    let Query(query) = put_query;

    // Get the billing id from the post query.
    let billing_id = query.billing_id;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Construct the query.
    let mut query = vec![];

    if let Some(balance_usd) = params.balance_usd {
        query.push(billing::balance_usd::set(balance_usd));
    }

    if let Some(status) = params.status {
        match status {
            BillingQueryStatus::Sponsored => {
                query.push(billing::status::set(BillingStatus::Sponsored))
            }
            BillingQueryStatus::User => query.push(billing::status::set(BillingStatus::User)),
        };
    };

    // Update the billing.
    let billing =
        state.client.billing().update(billing::id::equals(billing_id), query).exec().await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the billing to the format that the API expects.
    let billing: Billing = billing.into();

    Ok(Json::from(billing))
}
