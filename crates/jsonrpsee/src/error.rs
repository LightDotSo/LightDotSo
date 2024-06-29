// Copyright 2023-2024 Light.
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

use jsonrpsee::types::{
    error::{ErrorCode, INTERNAL_ERROR_CODE},
    ErrorObject, ErrorObjectOwned,
};

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
impl From<anyhow::Error> for JsonRpcError {
    fn from(err: anyhow::Error) -> Self {
        JsonRpcError(ErrorObject::owned(
            ErrorCode::InternalError.code(),
            format!("anyhow error: {err}"),
            None::<bool>,
        ))
    }
}

/// Convert a [eyre error](url::ParseError) to a [JsonRpcError](JsonRpcError).
impl From<eyre::Error> for JsonRpcError {
    fn from(err: eyre::Error) -> Self {
        JsonRpcError(ErrorObject::owned(
            ErrorCode::InternalError.code(),
            format!("eyre error: {err}"),
            None::<bool>,
        ))
    }
}

/// Convert a [url error](url::ParseError) to a [JsonRpcError](JsonRpcError).
impl From<url::ParseError> for JsonRpcError {
    fn from(err: url::ParseError) -> Self {
        JsonRpcError(ErrorObject::owned(
            ErrorCode::ParseError.code(),
            format!("URL serializing error: {err}"),
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
                    format!("Provider error: {:?}", err),
                    None::<bool>,
                ))
            }
            _ => JsonRpcError(ErrorObject::owned(
                INTERNAL_ERROR_CODE,
                format!("Provider error with no status code: {:?}", err),
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
