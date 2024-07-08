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

// Taken from official example: https://github.com/Brendonovich/prisma-client-rust/blob/124e8216a9d093e9ae1feb8b9b84614bc3579f18/examples/axum-rest/src/routes.rs

use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};
use eyre::{eyre, Report};
use prisma_client_rust::{
    prisma_errors::query_engine::{RecordNotFound, UniqueKeyViolation},
    QueryError,
};

#[derive(Debug)]
pub enum DbError {
    EyreError(eyre::Error),
    PrismaError(QueryError),
    NotFound,
}

impl From<eyre::Error> for DbError {
    fn from(error: eyre::Error) -> Self {
        DbError::EyreError(error)
    }
}

impl From<DbError> for eyre::Report {
    fn from(error: DbError) -> Self {
        match error {
            DbError::EyreError(err) => err,
            DbError::PrismaError(err) => Report::new(err),
            DbError::NotFound => eyre!("Record not found"),
        }
    }
}

impl From<QueryError> for DbError {
    fn from(error: QueryError) -> Self {
        match error {
            e if e.is_prisma_error::<RecordNotFound>() => DbError::NotFound,
            e => DbError::PrismaError(e),
        }
    }
}

// This centralizes all different errors from our app in one place
impl IntoResponse for DbError {
    fn into_response(self) -> Response {
        let status = match self {
            DbError::EyreError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            DbError::PrismaError(error) if error.is_prisma_error::<UniqueKeyViolation>() => {
                StatusCode::CONFLICT
            }
            DbError::PrismaError(_) => StatusCode::BAD_REQUEST,
            DbError::NotFound => StatusCode::NOT_FOUND,
        };

        status.into_response()
    }
}
