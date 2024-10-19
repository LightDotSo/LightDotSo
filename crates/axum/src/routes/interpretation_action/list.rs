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

use super::{error::InterpretationActionError, types::InterpretationAction};
use crate::result::AppJsonResult;
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::interpretation_action::{self, WhereParam};
use lightdotso_state::ClientState;
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

/// List interpretation actions
///
/// Returns a list of interpretation actions with optional filtering.
#[utoipa::path(
        get,
        path = "/interpretation_action/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Interpretation actions returned successfully", body = [InterpretationAction]),
            (status = 500, description = "Interpretation action bad request", body = InterpretationActionError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_interpretation_action_list_handler(
    list_query: Query<ListQuery>,
    State(state): State<ClientState>,
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

/// Count of list of interpretation actions
///
/// Returns a count of list of interpretation actions with optional filtering.
#[utoipa::path(
        get,
        path = "/interpretation_action/list/count",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Interpretation actions returned successfully", body = InterpretationActionListCount),
            (status = 500, description = "Interpretation action bad request", body = InterpretationActionError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_interpretation_action_list_count_handler(
    list_query: Query<ListQuery>,
    State(state): State<ClientState>,
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
        Some(address) => vec![or![
            interpretation_action::address::equals("".to_string()),
            interpretation_action::address::equals(address.to_string())
        ]],
        None => vec![],
    };

    if let Some(action) = &query.action {
        query_exp.push(interpretation_action::action::equals(action.to_string()));
    }

    query_exp
}
