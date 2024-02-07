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

use super::types::InterpretationAction;
use crate::{result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::interpretation_action::{self, WhereParam};
use prisma_client_rust::or;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    /// The offset of the first interpretation action to return.
    pub offset: Option<i64>,
    /// The maximum number of interpretation actions to return.
    pub limit: Option<i64>,
    /// The action to filter by.
    pub action: Option<String>,
    /// The address to filter by.
    pub address: Option<String>,
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Count of list of interpretation actions.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct InterpretationActionListCount {
    /// The count of the list of interpretation actions.
    pub count: i64,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Returns a list of interpretation actions
#[utoipa::path(
        get,
        path = "/interpretation_action/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Interpretation Actions returned successfully", body = [InterpretationAction]),
            (status = 500, description = "Interpretation Action bad request", body = InterpretationActionError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_interpretation_action_list_handler(
    list_query: Query<ListQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<Vec<InterpretationAction>> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list query.
    let Query(query) = list_query;

    // -------------------------------------------------------------------------
    // Params
    // -------------------------------------------------------------------------

    // If the address is provided, add it to the query.
    let query_params = construct_interpretation_action_list_query_params(&query);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the interpretation actions from the database.
    let interpretation_actions = state
        .client
        .interpretation_action()
        .find_many(query_params)
        .skip(query.offset.unwrap_or(0))
        .take(query.limit.unwrap_or(10))
        .exec()
        .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the interpretation actions to the format that the API expects.
    let interpretation_actions: Vec<InterpretationAction> =
        interpretation_actions.into_iter().map(InterpretationAction::from).collect();

    Ok(Json::from(interpretation_actions))
}

/// Returns a count of list of interpretation actions
#[utoipa::path(
        get,
        path = "/interpretation_action/list/count",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Interpretation actions returned successfully", body = InterpretationActionListCount),
            (status = 500, description = "InterpretationAction bad request", body = InterpretationActionError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_interpretation_action_list_count_handler(
    list_query: Query<ListQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<InterpretationActionListCount> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list query.
    let Query(query) = list_query;

    // -------------------------------------------------------------------------
    // Params
    // -------------------------------------------------------------------------

    // If the address is provided, add it to the query.
    let query_params = construct_interpretation_action_list_query_params(&query);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the interpretation actions from the database.
    let count = state.client.interpretation_action().count(query_params).exec().await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    Ok(Json::from(InterpretationActionListCount { count }))
}

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

/// Constructs a query for interpretation actions.
fn construct_interpretation_action_list_query_params(query: &ListQuery) -> Vec<WhereParam> {
    let mut query_exp = match &query.address {
        Some(address) => vec![
            or![interpretation_action::address::equals("".to_string())],
            or![interpretation_action::address::equals(address.to_string())],
        ],
        None => vec![],
    };

    if let Some(action) = &query.action {
        query_exp.push(interpretation_action::action::equals(action.to_string()));
    }

    query_exp
}
