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

use crate::{
    paymaster_api::PaymasterServer,
    types::{
        ErrorResponse, EstimateResult, GasAndPaymasterAndData, PaymasterAndData, Request, Response,
        UserOperationConstruct, UserOperationRequest,
    },
};
use async_trait::async_trait;
use ethers_main::types::Address;
use eyre::{Error, Result};
use jsonrpsee::{
    core::RpcResult,
    types::{error::INTERNAL_ERROR_CODE, ErrorObjectOwned},
};
use lightdotso_gas::gas::GasEstimation;
use lightdotso_tracing::tracing::{info, warn};
use serde_json::json;

/// The paymaster server implementation.
pub struct PaymasterServerImpl {}

#[async_trait]
impl PaymasterServer for PaymasterServerImpl {
    async fn request_paymaster_and_data(
        &self,
        _chain_id: u64,
        _user_operation: UserOperationRequest,
        _entry_point: Address,
    ) -> RpcResult<PaymasterAndData> {
        return Ok(PaymasterAndData::default());
    }

    async fn request_gas_and_paymaster_and_data(
        &self,
        chain_id: u64,
        user_operation: UserOperationRequest,
        entry_point: Address,
    ) -> RpcResult<GasAndPaymasterAndData> {
        // Construct the user operation w/ rpc.
        let construct = construct_user_operation(chain_id, user_operation, entry_point).await;

        // Error handling.
        if construct.is_err() {
            return Err(ErrorObjectOwned::owned(
                INTERNAL_ERROR_CODE,
                "Error getting construct".to_string(),
                None::<bool>,
            ));
        }
        let construct = construct.unwrap();

        return Ok(GasAndPaymasterAndData {
            call_gas_limit: construct.call_gas_limit,
            verification_gas_limit: construct.verification_gas_limit,
            pre_verification_gas: construct.pre_verification_gas,
            max_fee_per_gas: construct.max_fee_per_gas,
            max_priority_fee_per_gas: construct.max_priority_fee_per_gas,
            paymaster_and_data: PaymasterAndData::default(),
        });
    }
}

pub async fn construct_user_operation(
    chain_id: u64,
    user_operation: UserOperationRequest,
    entry_point: Address,
) -> Result<UserOperationConstruct> {
    let estimated_user_operation_gas =
        estimate_user_operation_gas(chain_id, entry_point, &user_operation).await?.result;

    let estimated_request_gas = estimate_request_gas_estimation(chain_id).await?.result;

    Ok(UserOperationConstruct {
        call_data: user_operation.call_data,
        init_code: user_operation.init_code,
        nonce: user_operation.nonce,
        sender: user_operation.sender,
        call_gas_limit: estimated_user_operation_gas.call_gas_limit,
        verification_gas_limit: estimated_user_operation_gas.verification_gas_limit,
        pre_verification_gas: estimated_user_operation_gas.pre_verification_gas,
        max_fee_per_gas: estimated_request_gas.average.max_fee_per_gas,
        max_priority_fee_per_gas: estimated_request_gas.average.max_priority_fee_per_gas,
        signature: user_operation.signature,
    })
}

pub async fn estimate_request_gas_estimation(chain_id: u64) -> Result<Response<GasEstimation>> {
    let params = vec![json!(chain_id)];

    let req_body = Request {
        jsonrpc: "2.0".to_string(),
        method: "gas_requestGasEstimation".to_string(),
        params: params.clone(),
        id: 1,
    };

    let client = reqwest::Client::new();
    let response =
        client.post("http://lightdotso-gas.internal:3000").json(&req_body).send().await?;

    // Handle the response for the JSON-RPC API.
    handle_response(response).await
}

/// From: https://github.com/qi-protocol/ethers-userop/blob/50cb1b18a551a681786f1a766d11215c80afa7cf/src/userop_middleware.rs#L128
/// License: MIT
pub async fn estimate_user_operation_gas(
    chain_id: u64,
    entry_point: Address,
    user_operation: &UserOperationRequest,
) -> Result<Response<EstimateResult>> {
    let params = vec![json!(user_operation), json!(entry_point)];

    let req_body = Request {
        jsonrpc: "2.0".to_string(),
        method: "eth_estimateUserOperationGas".to_string(),
        params: params.clone(),
        id: 1,
    };

    let client = reqwest::Client::new();
    let response = client
        .post(format!("http://lightdotso-rpc-internal.internal:3000/internal/{}", chain_id))
        .json(&req_body)
        .send()
        .await?;

    // Handle the response for the JSON-RPC API.
    handle_response(response).await
}

/// From: https://github.com/qi-protocol/ethers-userop/blob/50cb1b18a551a681786f1a766d11215c80afa7cf/src/userop_middleware.rs#L222
/// License: MIT
///
/// Helper function to handle the response from the bundler
///
/// # Arguments
/// * `response` - The response from the bundler
///
/// # Returns
/// * `Response<R>` - The success response if no error
pub async fn handle_response<R>(response: reqwest::Response) -> Result<Response<R>>
where
    R: std::fmt::Debug + serde::de::DeserializeOwned,
{
    let str_response = response.text().await?;
    let parsed_response: Result<Response<R>> =
        serde_json::from_str(&str_response).map_err(Error::from);

    match parsed_response {
        Ok(success_response) => {
            info!("Success {:?}", success_response);
            Ok(success_response)
        }
        Err(_) => {
            let error_response: ErrorResponse = serde_json::from_str(&str_response)?;
            let error_message = error_response.clone().error.message;
            warn!("Error: {:?}", error_response);
            Err(Error::msg(error_message))
        }
    }
}
