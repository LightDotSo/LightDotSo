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
use silius_primitives::simulation::SimulationCheckError;

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

/// Convert a [eyre error](url::ParseError) to a [JsonRpcError](JsonRpcError).
impl From<eyre::Error> for JsonRpcError {
    fn from(err: eyre::Error) -> Self {
        JsonRpcError(ErrorObject::owned(
            ErrorCode::InternalError.code(),
            format!("JSON serializing error: {err}"),
            None::<bool>,
        ))
    }
}

/// Convert a [url error](url::ParseError) to a [JsonRpcError](JsonRpcError).
impl From<url::ParseError> for JsonRpcError {
    fn from(err: url::ParseError) -> Self {
        JsonRpcError(ErrorObject::owned(
            ErrorCode::ParseError.code(),
            format!("JSON serializing error: {err}"),
            None::<bool>,
        ))
    }
}

/// Convert a [serde_json error](serde_json::Error) to a [JsonRpcError](JsonRpcError).
impl From<serde_json::Error> for JsonRpcError {
    fn from(err: serde_json::Error) -> Self {
        JsonRpcError(ErrorObject::owned(
            ErrorCode::ParseError.code(),
            format!("JSON serializing error: {err}"),
            None::<bool>,
        ))
    }
}

/// Convert a [ethers provider error](reqwest::Error) to a [JsonRpcError](JsonRpcError).
impl From<ethers::providers::ProviderError> for JsonRpcError {
    fn from(err: ethers::providers::ProviderError) -> Self {
        match err {
            ethers::providers::ProviderError::JsonRpcClientError(err) => {
                JsonRpcError(ErrorObject::owned(
                    INTERNAL_ERROR_CODE,
                    format!("Network error: {:?}", err),
                    None::<bool>,
                ))
            }
            _ => JsonRpcError(ErrorObject::owned(
                INTERNAL_ERROR_CODE,
                format!("Network error with no status code: {:?}", err),
                None::<bool>,
            )),
        }
    }
}

/// Convert a [reqwest error](reqwest::Error) to a [JsonRpcError](JsonRpcError).
impl From<reqwest::Error> for JsonRpcError {
    fn from(err: reqwest::Error) -> Self {
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

/// Convert a [SimulationCheckError](SimulationCheckError) to a [JsonRpcError](JsonRpcError).
impl From<SimulationCheckError> for JsonRpcError {
    fn from(err: SimulationCheckError) -> Self {
        match err {
            SimulationCheckError::Signature {} => {
                JsonRpcError(ErrorObject::owned(
                    ErrorCode::ParseError.code(),
                    "Simulation check error: Signature error".to_string(),
                    None::<bool>,
                ))
            }
            SimulationCheckError::Expiration {
                valid_after,
                valid_until,
                paymaster,
            } => {
                JsonRpcError(ErrorObject::owned(
                    ErrorCode::ParseError.code(),
                    format!(
                        "Simulation check error: Expiration error with values: valid_after: {:?}, valid_until: {:?}, paymaster: {:?}",
                        valid_after, valid_until, paymaster
                    ),
                    None::<bool>,
                ))
            }
            SimulationCheckError::Validation { message }
            | SimulationCheckError::Execution { message }
            | SimulationCheckError::CallStack { message }
            | SimulationCheckError::CodeHashes { message }
            | SimulationCheckError::MiddlewareError { message }
            | SimulationCheckError::UnknownError { message } => {
                JsonRpcError(ErrorObject::owned(
                    ErrorCode::ParseError.code(),
                    format!("Simulation check error: {}", message),
                    None::<bool>,
                ))
            }
            SimulationCheckError::Opcode { entity, opcode } => {
                JsonRpcError(ErrorObject::owned(
                    ErrorCode::ParseError.code(),
                    format!("Simulation check error: Opcode error with entity: {}, opcode: {}", entity, opcode),
                    None::<bool>,
                ))
            }
            SimulationCheckError::StorageAccess { slot } => {
                JsonRpcError(ErrorObject::owned(
                    ErrorCode::ParseError.code(),
                    format!("Simulation check error: Storage access error with slot: {}", slot),
                    None::<bool>,
                ))
            }
            SimulationCheckError::Unstaked { entity, message } => {
                JsonRpcError(ErrorObject::owned(
                    ErrorCode::ParseError.code(),
                    format!("Simulation check error: Unstaked error with entity: {}, message: {}", entity, message),
                    None::<bool>,
                ))
            }
            SimulationCheckError::OutOfGas {} => {
                JsonRpcError(ErrorObject::owned(
                    ErrorCode::ParseError.code(),
                    "Simulation check error: Ran out of gas".to_string(),
                    None::<bool>,
                ))
            }
        }
    }
}
