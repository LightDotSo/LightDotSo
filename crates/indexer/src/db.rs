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

use axum::{extract::Json, Extension};

use crate::error::AppError;
use lightdotso_prisma::{user, PrismaClient};
use std::sync::Arc;

type Database = Extension<Arc<PrismaClient>>;
type AppResult<T> = Result<T, AppError>;
type AppJsonResult<T> = AppResult<Json<T>>;

pub async fn find_user(client: &Arc<PrismaClient>) -> Vec<user::Data> {
    let users: Vec<user::Data> =
        client.user().find_many(vec![user::id::equals("Id".to_string())]).exec().await.unwrap();

    users
}

/// GET /user
/// Taken from: https://github.com/Brendonovich/prisma-client-rust/blob/124e8216a9d093e9ae1feb8b9b84614bc3579f18/examples/axum-rest/src/routes.rs
pub async fn handle_user_get(db: Database) -> AppJsonResult<Vec<user::Data>> {
    let users = db.user().find_many(vec![]).with(user::sessions::fetch(vec![])).exec().await?;

    Ok(Json::from(users))
}
