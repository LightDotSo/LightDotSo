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

use crate::{
    billing_operation::create_billing_operation_msg,
    services::fetch_gas_and_paymaster_and_data_variant,
    utils::{construct_packed_user_operation, construct_user_operation},
};
use alloy::primitives::Address;
use jsonrpsee::core::RpcResult;
use lightdotso_contracts::types::{
    GasAndPaymasterAndData, GasAndPaymasterAndDataVariant, PaymasterAndData,
    UserOperationRequestVariant,
};
use lightdotso_jsonrpsee::error::JsonRpcError;
use lightdotso_tracing::tracing::info;

// -----------------------------------------------------------------------------
// Structs
// -----------------------------------------------------------------------------

/// The paymaster api implementation.
pub(crate) struct PaymasterApi {}

// -----------------------------------------------------------------------------
// Implementations
// -----------------------------------------------------------------------------

impl PaymasterApi {
    pub(crate) async fn request_paymaster_and_data(
        &self,
        user_operation: UserOperationRequestVariant,
        entry_point: Address,
        chain_id: u64,
    ) -> RpcResult<PaymasterAndData> {
        let res =
            self.request_gas_and_paymaster_and_data(user_operation, entry_point, chain_id).await?;
        match res {
            GasAndPaymasterAndDataVariant::Default(gas_and_paymaster_and_data) => {
                Ok(PaymasterAndData {
                    paymaster_and_data: gas_and_paymaster_and_data.paymaster_and_data,
                })
            }
            GasAndPaymasterAndDataVariant::Packed(packed_gas_and_paymaster_and_data) => {
                let gas_and_paymaster_and_data: GasAndPaymasterAndData =
                    packed_gas_and_paymaster_and_data.into();

                Ok(PaymasterAndData {
                    paymaster_and_data: gas_and_paymaster_and_data.paymaster_and_data,
                })
            }
        }
    }

    pub(crate) async fn request_gas_and_paymaster_and_data(
        &self,
        user_operation_request: UserOperationRequestVariant,
        entry_point: Address,
        chain_id: u64,
    ) -> RpcResult<GasAndPaymasterAndDataVariant> {
        match user_operation_request.clone() {
            UserOperationRequestVariant::Default(uor) => {
                // Construct the user operation w/ rpc.
                let user_operation = construct_user_operation(chain_id, uor.clone(), entry_point)
                    .await
                    .map_err(JsonRpcError::from)?;
                // Log the construct in hex.
                info!("user_operation: {:?}", user_operation);

                // Get the paymaster operation sponsor.
                let gas_and_paymaster_and_data_variant = fetch_gas_and_paymaster_and_data_variant(
                    user_operation_request.clone(),
                    entry_point,
                    chain_id,
                )
                .await
                .map_err(JsonRpcError::from)?;

                // Write the paymaster operation to the database.
                create_billing_operation_msg(
                    chain_id,
                    user_operation,
                    gas_and_paymaster_and_data_variant.clone(),
                )
                .await
                .map_err(JsonRpcError::from)?;

                Ok(gas_and_paymaster_and_data_variant)
            }
            UserOperationRequestVariant::Packed(puor) => {
                // Construct the packed user operation w/ rpc.
                let packed_user_operation =
                    construct_packed_user_operation(chain_id, puor.clone(), entry_point)
                        .await
                        .map_err(JsonRpcError::from)?;
                // Log the packed_user_operation in hex.
                info!("packed_user_operation: {:?}", packed_user_operation);

                // Get the paymaster operation sponsor.
                let gas_and_paymaster_and_data_variant = fetch_gas_and_paymaster_and_data_variant(
                    user_operation_request.clone(),
                    entry_point,
                    chain_id,
                )
                .await
                .map_err(JsonRpcError::from)?;

                // Write the paymaster operation to the database.
                create_billing_operation_msg(
                    chain_id,
                    packed_user_operation.into(),
                    gas_and_paymaster_and_data_variant.clone(),
                )
                .await
                .map_err(JsonRpcError::from)?;

                Ok(gas_and_paymaster_and_data_variant)
            }
        }
    }
}
