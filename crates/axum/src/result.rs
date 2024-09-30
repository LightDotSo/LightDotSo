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

use crate::error::{RouteError, RouteErrorStatusCodeAndMsg};
use alloy::hex::FromHexError;
use axum::{
    response::{IntoResponse, Response},
    Json,
};
use hyper::StatusCode;
use lightdotso_redis::redis::RedisError;
use prisma_client_rust::{
    chrono::ParseError,
    prisma_errors::query_engine::{RecordNotFound, UniqueKeyViolation},
    QueryError,
};
use rustc_hex::FromHexError as RustHexError;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// From: https://github.com/Brendonovich/prisma-client-rust/blob/e520c5f6e30c0839d9dbccaa228f3eedbf188b6c/examples/axum-rest/src/routes.rs#L18
// type Database = Extension<Arc<PrismaClient>>;
pub(crate) type AppResult<T> = Result<T, AppError>;
pub(crate) type AppJsonResult<T> = AppResult<Json<T>>;

// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------

/// From: https://github.com/Brendonovich/prisma-client-rust/blob/e520c5f6e30c0839d9dbccaa228f3eedbf188b6c/examples/axum-rest/src/routes.rs#L118
pub(crate) enum AppError {
    EyreError(eyre::Error),
    PrismaError(QueryError),
    RedisError(RedisError),
    SerdeJsonError(serde_json::Error),
    FromHexError(FromHexError),
    RustHexError(RustHexError),
    RouteError(RouteError),
    AuthError(String),
    BadRequest,
    NotFound,
    InternalError,
    Conflict,
}

// -----------------------------------------------------------------------------
// From
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Implementations
// -----------------------------------------------------------------------------

/// From: https://github.com/Brendonovich/prisma-client-rust/blob/e520c5f6e30c0839d9dbccaa228f3eedbf188b6c/examples/axum-rest/src/routes.rs#L133
impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let status = match self {
            AppError::RouteError(err) => err.error_status_code_and_msg(),
            AppError::EyreError(err) => (StatusCode::BAD_REQUEST, err.to_string()),
            AppError::PrismaError(err) if err.is_prisma_error::<UniqueKeyViolation>() => {
                (StatusCode::BAD_REQUEST, "Prisma Error: Unique key violation".to_string())
            }
            AppError::PrismaError(err) => {
                (StatusCode::INTERNAL_SERVER_ERROR, format!("Prisma Error: {}", err))
            }
            AppError::RedisError(err) => {
                (StatusCode::INTERNAL_SERVER_ERROR, format!("Redis Error: {}", err))
            }
            AppError::SerdeJsonError(err) => {
                (StatusCode::BAD_REQUEST, format!("Serde JSON Error: {}", err))
            }
            AppError::FromHexError(err) => (StatusCode::BAD_REQUEST, format!("Bad Hex: {}", err)),
            AppError::RustHexError(err) => {
                (StatusCode::BAD_REQUEST, format!("Bad Rust Hex: {}", err))
            }
            AppError::Conflict => (StatusCode::CONFLICT, "Conflict".to_string()),
            AppError::AuthError(msg) => (StatusCode::UNAUTHORIZED, msg),
            AppError::BadRequest => (StatusCode::BAD_REQUEST, "Bad Request".to_string()),
            AppError::NotFound => (StatusCode::NOT_FOUND, "Not Found".to_string()),
            AppError::InternalError => {
                (StatusCode::INTERNAL_SERVER_ERROR, "Internal Server Error".to_string())
            }
        };

        status.into_response()
    }
}

impl std::fmt::Debug for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AppError::EyreError(err) => write!(f, "EyreError: {:?}", err),
            AppError::PrismaError(err) => write!(f, "PrismaError: {:?}", err),
            AppError::RedisError(err) => write!(f, "RedisError: {:?}", err),
            AppError::SerdeJsonError(err) => write!(f, "SerdeJsonError: {:?}", err),
            AppError::FromHexError(err) => write!(f, "FromHexError: {:?}", err),
            AppError::RustHexError(err) => write!(f, "RustHexError: {:?}", err),
            AppError::RouteError(err) => write!(f, "RouteError: {:?}", err),
            AppError::AuthError(msg) => write!(f, "AuthError: {}", msg),
            AppError::BadRequest => write!(f, "BadRequest"),
            AppError::NotFound => write!(f, "NotFound"),
            AppError::InternalError => write!(f, "InternalError"),
            AppError::Conflict => write!(f, "Conflict"),
        }
    }
}
