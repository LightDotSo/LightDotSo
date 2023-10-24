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
use axum::{
    extract::{Query, State},
    routing::post,
    Json, Router,
};
use ethers_main::{types::H160, utils::to_checksum};
use lightdotso_prisma::support_request;
use lightdotso_tracing::tracing::info;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct PostQuery {
    // The wallet address of the user operation.
    pub wallet_address: String,
}

/// Support_request operation errors
#[derive(Serialize, Deserialize, ToSchema)]
pub(crate) enum SupportRequestError {
    // Support_request query error.
    #[schema(example = "Bad request")]
    BadRequest(String),
    /// Support_request not found by id.
    #[schema(example = "id = 1")]
    NotFound(String),
}

/// Item to do.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct SupportRequest {
    // The title of the support_request.
    pub title: String,
    // The description of the support_request.
    pub description: String,
    // The area of the support_request.
    pub area: String,
    // The severity of the support_request.
    pub severity: i32,
}

#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub struct SupportRequestPostRequestParams {
    /// The result of the support_request.
    pub support_request: SupportRequest,
}

// Implement From<support_request::Data> for Support_request.
impl From<support_request::Data> for SupportRequest {
    fn from(support_request: support_request::Data) -> Self {
        Self {
            title: support_request.title,
            description: support_request.description,
            area: support_request.area,
            severity: support_request.severity,
        }
    }
}

#[autometrics]
pub(crate) fn router() -> Router<AppState> {
    Router::new().route("/support_request/create", post(v1_support_request_post_handler))
}

/// Create a support_request
#[utoipa::path(
        post,
        path = "/support_request/create",
        params(
            PostQuery
        ),
        request_body = SupportRequestPostRequestParams,
        responses(
            (status = 200, description = "Support_request created successfully", body = UserOperation),
            (status = 500, description = "Support_request internal error", body = UserOperationError),
        )
    )]
#[autometrics]
async fn v1_support_request_post_handler(
    post: Query<PostQuery>,
    State(client): State<AppState>,
    Json(params): Json<SupportRequestPostRequestParams>,
) -> AppJsonResult<SupportRequest> {
    // Get the post query.
    let Query(post) = post;

    // Get the wallet address from the post query.
    let wallet_address: H160 = post.wallet_address.parse()?;

    // Get the support_request from the post body.
    let support_request = params.support_request;

    // Create the support_request the database.
    let support_request = client
        .client
        .unwrap()
        .support_request()
        .create(
            support_request.title,
            support_request.description,
            support_request.area,
            support_request.severity,
            lightdotso_prisma::wallet::address::equals(to_checksum(&wallet_address, None)),
            vec![],
        )
        .exec()
        .await?;
    info!(?support_request);

    // Change the support_requests to the format that the API expects.
    let support_request: SupportRequest = support_request.into();

    Ok(Json::from(support_request))
}
