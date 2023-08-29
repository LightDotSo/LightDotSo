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

use jsonrpsee::types::{
    error::{ErrorCode, INTERNAL_ERROR_CODE},
    ErrorObject, ErrorObjectOwned,
};
use reqwest::Error as ReqwestError;

// From: https://github.com/shunkakinoki/silius/blob/6a92f9414263754a74a193ce79b489db58cbbc43/crates/rpc/src/error.rs#L15-L23
// JsonRpcError is a wrapper for the ErrorObjectOwned type.

/// A wrapper for the [ErrorObjectOwned](ErrorObjectOwned) type.
pub struct JsonRpcError(pub ErrorObjectOwned);

impl From<JsonRpcError> for ErrorObjectOwned {
    /// Convert a [JsonRpcError](JsonRpcError) to a [ErrorObjectOwned](ErrorObjectOwned).
    fn from(err: JsonRpcError) -> Self {
        err.0
    }
}

impl From<serde_json::Error> for JsonRpcError {
    /// Convert a [serde_json error](serde_json::Error) to a [JsonRpcError](JsonRpcError).
    fn from(err: serde_json::Error) -> Self {
        JsonRpcError(ErrorObject::owned(
            ErrorCode::ParseError.code(),
            format!("JSON serializing error: {err}"),
            None::<bool>,
        ))
    }
}

impl From<ReqwestError> for JsonRpcError {
    fn from(err: ReqwestError) -> Self {
        match err.status() {
            Some(status) => JsonRpcError(ErrorObject::owned(
                ErrorCode::ServerError(status.as_u16() as i32).code(),
                format!("Network error: {:?}", err),
                None::<bool>,
            )),
            None => JsonRpcError(ErrorObject::owned(
                INTERNAL_ERROR_CODE,
                format!("Network error with no status code: {:?}", err),
                None::<bool>,
            )),
        }
    }
}
