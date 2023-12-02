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

use crate::error::{RouteError, RouteErrorStatusCodeAndMsg};
use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use const_hex::FromHexError;
use lightdotso_redis::redis::RedisError;
use prisma_client_rust::{
    chrono::ParseError,
    prisma_errors::query_engine::{RecordNotFound, UniqueKeyViolation},
    QueryError,
};
use rustc_hex::FromHexError as RustHexError;

/// From: https://github.com/Brendonovich/prisma-client-rust/blob/e520c5f6e30c0839d9dbccaa228f3eedbf188b6c/examples/axum-rest/src/routes.rs#L18
// type Database = Extension<Arc<PrismaClient>>;
pub(crate) type AppResult<T> = Result<T, AppError>;
pub(crate) type AppJsonResult<T> = AppResult<Json<T>>;

/// From: https://github.com/Brendonovich/prisma-client-rust/blob/e520c5f6e30c0839d9dbccaa228f3eedbf188b6c/examples/axum-rest/src/routes.rs#L118
pub(crate) enum AppError {
    EyreError(eyre::Error),
    PrismaError(QueryError),
    RedisError(RedisError),
    SerdeJsonError(serde_json::Error),
    FromHexError(FromHexError),
    RustHexError(RustHexError),
    RouteError(RouteError),
    BadRequest,
    NotFound,
    InternalError,
    Conflict,
}

impl From<eyre::Error> for AppError {
    fn from(error: eyre::Error) -> Self {
        AppError::EyreError(error)
    }
}

impl From<ParseError> for AppError {
    fn from(error: ParseError) -> Self {
        AppError::EyreError(error.into())
    }
}

impl From<serde_json::Error> for AppError {
    fn from(error: serde_json::Error) -> Self {
        AppError::SerdeJsonError(error)
    }
}

impl From<FromHexError> for AppError {
    fn from(error: FromHexError) -> Self {
        AppError::FromHexError(error)
    }
}

impl From<RustHexError> for AppError {
    fn from(error: RustHexError) -> Self {
        AppError::RustHexError(error)
    }
}

/// From: https://github.com/Brendonovich/prisma-client-rust/blob/e520c5f6e30c0839d9dbccaa228f3eedbf188b6c/examples/axum-rest/src/routes.rs#L123
impl From<QueryError> for AppError {
    fn from(error: QueryError) -> Self {
        match error {
            e if e.is_prisma_error::<RecordNotFound>() => AppError::NotFound,
            e => AppError::PrismaError(e),
        }
    }
}

impl From<RedisError> for AppError {
    fn from(error: RedisError) -> Self {
        AppError::RedisError(error)
    }
}

impl From<RouteError> for AppError {
    fn from(error: RouteError) -> Self {
        AppError::RouteError(error)
    }
}
/// From: https://github.com/Brendonovich/prisma-client-rust/blob/e520c5f6e30c0839d9dbccaa228f3eedbf188b6c/examples/axum-rest/src/routes.rs#L133
impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let status = match self {
            AppError::RouteError(err) => err.error_status_code_and_msg(),
            AppError::PrismaError(error) if error.is_prisma_error::<UniqueKeyViolation>() => {
                (StatusCode::BAD_REQUEST, "Prisma Error: Unique key violation".to_string())
            }
            AppError::EyreError(eyre_msg) => (StatusCode::BAD_REQUEST, eyre_msg.to_string()),
            AppError::PrismaError(_) => {
                (StatusCode::INTERNAL_SERVER_ERROR, "Prisma Error".to_string())
            }
            AppError::RedisError(_) => {
                (StatusCode::INTERNAL_SERVER_ERROR, "Redis Error".to_string())
            }
            AppError::SerdeJsonError(_) => {
                (StatusCode::BAD_REQUEST, "Serde JSON Error".to_string())
            }
            AppError::FromHexError(_) => (StatusCode::BAD_REQUEST, "Bad Hex".to_string()),
            AppError::RustHexError(_) => (StatusCode::BAD_REQUEST, "Bad Rust Hex".to_string()),
            AppError::Conflict => (StatusCode::CONFLICT, "Conflict".to_string()),
            AppError::BadRequest => (StatusCode::BAD_REQUEST, "Bad Request".to_string()),
            AppError::NotFound => (StatusCode::NOT_FOUND, "Not Found".to_string()),
            AppError::InternalError => {
                (StatusCode::INTERNAL_SERVER_ERROR, "Internal Server Error".to_string())
            }
        };

        status.into_response()
    }
}
