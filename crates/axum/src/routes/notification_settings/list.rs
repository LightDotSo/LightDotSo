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

use super::types::NotificationSettings;
use crate::{result::AppJsonResult, state::AppState};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_prisma::notification_settings::{self, WhereParam};
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    /// The offset of the first notification settings to return.
    pub offset: Option<i64>,
    /// The maximum number of notification settingss to return.
    pub limit: Option<i64>,
    /// The flag to filter by enabled or disabled.
    pub is_enabled: Option<bool>,
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Count of list of notification settingss.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct NotificationSettingsListCount {
    /// The count of the list of notification settingss.
    pub count: i64,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Returns a list of notification settingss
#[utoipa::path(
        get,
        path = "/notification_settings/list",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Notification settingss returned successfully", body = [NotificationSettings]),
            (status = 500, description = "Notification settings bad request", body = NotificationSettingsError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_notification_settings_list_handler(
    list_query: Query<ListQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<Vec<NotificationSettings>> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list query.
    let Query(query) = list_query;

    // -------------------------------------------------------------------------
    // Params
    // -------------------------------------------------------------------------

    // If the address is provided, add it to the query.
    let query_params = construct_notification_settings_list_query_params(&query);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the notification settingss from the database.
    let notification_settingss = state
        .client
        .notification_settings()
        .find_many(query_params)
        .skip(query.offset.unwrap_or(0))
        .take(query.limit.unwrap_or(10))
        .exec()
        .await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Change the notification settingss to the format that the API expects.
    let notification_settingss: Vec<NotificationSettings> =
        notification_settingss.into_iter().map(NotificationSettings::from).collect();

    Ok(Json::from(notification_settingss))
}

/// Returns a count of list of notification settingss
#[utoipa::path(
        get,
        path = "/notification_settings/list/count",
        params(
            ListQuery
        ),
        responses(
            (status = 200, description = "Notification settingss returned successfully", body = NotificationSettingsListCount),
            (status = 500, description = "NotificationSettings bad request", body = NotificationSettingsError),
        )
    )]
#[autometrics]
pub(crate) async fn v1_notification_settings_list_count_handler(
    list_query: Query<ListQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<NotificationSettingsListCount> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the list query.
    let Query(query) = list_query;

    // -------------------------------------------------------------------------
    // Params
    // -------------------------------------------------------------------------

    // If the address is provided, add it to the query.
    let query_params = construct_notification_settings_list_query_params(&query);

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the notification settingss from the database.
    let count = state.client.notification_settings().count(query_params).exec().await?;

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    Ok(Json::from(NotificationSettingsListCount { count }))
}

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

/// Constructs a query for notification settingss.
fn construct_notification_settings_list_query_params(query: &ListQuery) -> Vec<WhereParam> {
    let mut query_exp = vec![];

    if let Some(is_enabled) = query.is_enabled {
        query_exp.push(notification_settings::is_enabled::equals(is_enabled));
    }

    // let mut query_exp = match &query.address {
    //     Some(address) => vec![
    //         or![notification_settings::address::equals("".to_string())],
    //         or![notification_settings::address::equals(address.to_string())],
    //     ],
    //     None => vec![],
    // };

    // if let Some(action) = &query.action {
    //     query_exp.push(notification_settings::action::equals(action.to_string()));
    // }

    query_exp
}
