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

use serde::{Deserialize, Serialize};

/// From: https://github.com/qi-protocol/ethers-userop/blob/50cb1b18a551a681786f1a766d11215c80afa7cf/src/types.rs#L19-L20
/// License: MIT
/// Primitive request types for the JSON-RPC API.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Request<T> {
    pub jsonrpc: String,
    pub id: u64,
    pub method: String,
    pub params: T,
}

/// From: https://github.com/qi-protocol/ethers-userop/blob/50cb1b18a551a681786f1a766d11215c80afa7cf/src/types.rs#L35
/// License: MIT
/// Primitive response types for the JSON-RPC API.
#[derive(Clone, Debug, Deserialize)]
pub struct Response<R> {
    pub jsonrpc: String,
    pub id: u64,
    pub result: R,
}

/// From: https://github.com/qi-protocol/ethers-userop/blob/50cb1b18a551a681786f1a766d11215c80afa7cf/src/types.rs#L42
/// License: MIT
#[allow(dead_code)]
#[derive(Clone, Debug, Deserialize)]
pub(crate) struct ErrorResponse {
    pub(crate) jsonrpc: String,
    pub(crate) id: u64,
    pub(crate) error: JsonRpcError,
}

/// From: https://github.com/qi-protocol/ethers-userop/blob/50cb1b18a551a681786f1a766d11215c80afa7cf/src/types.rs#L49
/// License: MIT
#[derive(Clone, Debug, Serialize, Deserialize)]
pub(crate) struct JsonRpcError {
    pub code: i64,
    pub message: String,
}
