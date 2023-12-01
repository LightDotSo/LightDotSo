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

use crate::routes::{
    configuration::ConfigurationError, paymaster_operation::PaymasterOperationError,
};
use http::StatusCode;

#[allow(dead_code)]
pub(crate) enum RouteError {
    ConfigurationError(ConfigurationError),
    PaymasterOperationError(PaymasterOperationError),
}

pub trait RouteErrorStatusCodeAndMsg {
    fn error_status_code_and_msg(&self) -> (StatusCode, String);
}

impl RouteErrorStatusCodeAndMsg for ConfigurationError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            ConfigurationError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            ConfigurationError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
        }
    }
}

impl RouteErrorStatusCodeAndMsg for PaymasterOperationError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            PaymasterOperationError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            PaymasterOperationError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
        }
    }
}

impl RouteErrorStatusCodeAndMsg for RouteError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            RouteError::ConfigurationError(err) => err.error_status_code_and_msg(),
            RouteError::PaymasterOperationError(err) => err.error_status_code_and_msg(),
        }
    }
}
