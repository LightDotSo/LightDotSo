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
    result::{AppError, AppJsonResult},
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    routing::get,
    Json, Router,
};
use ethers_main::{types::H160, utils::to_checksum};
use lightdotso_prisma::user;
use lightdotso_tracing::tracing::info;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    pub address: String,
}

/// User operation errors
#[derive(Serialize, Deserialize, ToSchema)]
pub(crate) enum UserError {
    // User query error.
    #[schema(example = "Bad request")]
    BadRequest(String),
    /// User not found by id.
    #[schema(example = "id = 1")]
    NotFound(String),
}

/// Item to do.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct User {
    id: String,
}

// Implement From<user::Data> for User.
impl From<user::Data> for User {
    fn from(user: user::Data) -> Self {
        Self { id: user.id }
    }
}

#[autometrics]
pub(crate) fn router() -> Router<AppState> {
    Router::new().route("/user/get", get(v1_user_get_handler))
}

/// Get a user
#[utoipa::path(
        get,
        path = "/user/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "User returned successfully", body = User),
            (status = 404, description = "User not found", body = UserError),
        )
    )]
#[autometrics]
async fn v1_user_get_handler(
    get: Query<GetQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<User> {
    // Get the get query.
    let Query(query) = get;

    info!("Get user for address: {:?}", query);

    let parsed_query_address: H160 = query.address.parse()?;

    // Get the users from the database.
    let user = client
        .client
        .unwrap()
        .user()
        .find_unique(user::address::equals(to_checksum(&parsed_query_address, None)))
        .exec()
        .await?;

    // If the user is not found, return a 404.
    let user = user.ok_or(AppError::NotFound)?;

    // Change the user to the format that the API expects.
    let user: User = user.into();

    Ok(Json::from(user))
}
