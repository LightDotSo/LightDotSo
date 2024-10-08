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

#![allow(clippy::unwrap_used)]

use crate::{
    constants::{
        ALCHEMY_POLICY_IDS, BICONOMY_PAYMASTER_RPC_URLS, BICONOMY_POLICY_IDS,
        PARTICLE_NETWORK_PAYMASTER_BASE_URL, PIMLICO_BASE_URL, PIMLICO_SPONSORSHIP_POLICIES,
    },
    services::{
        alchemy::get_alchemy_paymaster_and_data, biconomy::get_biconomy_paymaster_and_data,
    },
    utils::{get_gas_and_paymaster_and_data, get_packed_gas_and_paymaster_and_data},
};
use alchemy::get_packed_alchemy_paymaster_and_data;
use alloy::primitives::Address;
use eyre::{eyre, Result};
use lightdotso_contracts::types::{
    GasAndPaymasterAndData, GasAndPaymasterAndDataVariant, PackedGasAndPaymasterAndData,
    UserOperationRequestVariant,
};

use lightdotso_jsonrpsee::error::JsonRpcError;
use lightdotso_rpc::constants::{ALCHEMY_RPC_URLS, PARTICLE_RPC_URLS, PIMLICO_RPC_URLS};
use lightdotso_tracing::tracing::{info, warn};
use lightdotso_utils::is_testnet;
use serde_json::json;

pub mod alchemy;
pub mod biconomy;

// -----------------------------------------------------------------------------
// Services
// -----------------------------------------------------------------------------

// Retryable sponsorship fetch function.
pub async fn fetch_gas_and_paymaster_and_data_variant(
    user_operation_variant: UserOperationRequestVariant,
    entry_point: Address,
    chain_id: u64,
) -> Result<GasAndPaymasterAndDataVariant> {
    // Get the environment variable, `PIMLICO_API_KEY`.
    let pimlico_api_key =
        std::env::var("PIMLICO_API_KEY").map_err(|_| eyre!("PIMLICO_API_KEY not set"))?;

    // Check if the `chain_id` is one of the key of `PIMLICO_RPC_URLS`.
    if (*PIMLICO_RPC_URLS).contains_key(&chain_id) {
        // For each paymaster policy, attempt to fetch the user operation sponsorship.
        for policy in PIMLICO_SPONSORSHIP_POLICIES.iter() {
            info!("[SPONSORSHIP]: pimlico");
            info!("pimlico policy: {:?}", policy);

            match user_operation_variant.clone() {
                UserOperationRequestVariant::Default(user_operation) => {
                    let sponsorship = get_gas_and_paymaster_and_data(
                        format!(
                            "{}/{}/rpc?apikey={}",
                            *PIMLICO_BASE_URL, chain_id, pimlico_api_key
                        ),
                        entry_point,
                        &user_operation,
                        if !is_testnet(chain_id) {
                            Some(json!({
                                "sponsorshipPolicyId": policy
                            }))
                        } else {
                            None
                        },
                    )
                    .await
                    .map_err(JsonRpcError::from);

                    // If the sponsorship is successful, return the result.
                    if let Ok(sponsorship_data) = sponsorship {
                        return Ok(GasAndPaymasterAndDataVariant::Default(sponsorship_data.result));
                    } else {
                        warn!("Failed to fetch user operation sponsorship from pimlico");
                    }
                }
                UserOperationRequestVariant::Packed(packed_user_operation) => {
                    let sponsorship = get_packed_gas_and_paymaster_and_data(
                        format!(
                            "{}/{}/rpc?apikey={}",
                            *PIMLICO_BASE_URL, chain_id, pimlico_api_key
                        ),
                        entry_point,
                        &packed_user_operation,
                    )
                    .await
                    .map_err(JsonRpcError::from);

                    // If the sponsorship is successful, return the result.
                    if let Ok(sponsorship_data) = sponsorship {
                        return Ok(GasAndPaymasterAndDataVariant::Packed(sponsorship_data.result));
                    } else {
                        warn!("Failed to fetch user operation sponsorship from pimlico");
                    }
                }
            };
        }
    }

    // Get the environment variable, `PARTICLE_NETWORK_PROJECT_ID`.
    let particle_network_project_id = std::env::var("PARTICLE_NETWORK_PROJECT_ID")
        .map_err(|_| eyre!("PARTICLE_NETWORK_PROJECT_ID not set"))?;
    let particle_network_paymaster_project_key = std::env::var("PARTICLE_NETWORK_PROJECT_KEY")
        .map_err(|_| eyre!("PARTICLE_NETWORK_PROJECT_KEY not set"))?;

    // Check if the `chain_id` is one of the key of `PARTICLE_RPC_URLS`.
    if (*PARTICLE_RPC_URLS).contains_key(&chain_id) {
        info!("[SPONSORSHIP]: particle network");

        match user_operation_variant.clone() {
            UserOperationRequestVariant::Default(user_operation) => {
                let sponsorship = get_gas_and_paymaster_and_data(
                    format!(
                        "{}?chainId={}&projectUuid={}&projectKey={}",
                        *PARTICLE_NETWORK_PAYMASTER_BASE_URL,
                        chain_id,
                        particle_network_project_id,
                        particle_network_paymaster_project_key
                    ),
                    entry_point,
                    &user_operation,
                    None,
                )
                .await
                .map_err(JsonRpcError::from);

                // If the sponsorship is successful, return the result.
                if let Ok(sponsorship_data) = sponsorship {
                    return Ok(GasAndPaymasterAndDataVariant::Default(sponsorship_data.result));
                } else {
                    warn!("Failed to fetch user operation sponsorship from particle network");
                }
            }
            UserOperationRequestVariant::Packed(packed_user_operation) => {
                let sponsorship = get_packed_gas_and_paymaster_and_data(
                    format!(
                        "{}?chainId={}&projectUuid={}&projectKey={}",
                        *PARTICLE_NETWORK_PAYMASTER_BASE_URL,
                        chain_id,
                        particle_network_project_id,
                        particle_network_paymaster_project_key
                    ),
                    entry_point,
                    &packed_user_operation,
                )
                .await
                .map_err(JsonRpcError::from);

                // If the sponsorship is successful, return the result.
                if let Ok(sponsorship_data) = sponsorship {
                    return Ok(GasAndPaymasterAndDataVariant::Packed(sponsorship_data.result));
                } else {
                    warn!("Failed to fetch user operation sponsorship from particle network");
                }
            }
        };
    }

    // Get the environment variable, `ALCHEMY_API_KEY`.
    let alchemy_api_key =
        std::env::var("ALCHEMY_API_KEY").map_err(|_| eyre!("ALCHEMY_API_KEY not set"))?;

    // Check if the `chain_id` is one of the key of `ALCHEMY_POLICY_IDS`.
    if (*ALCHEMY_POLICY_IDS).contains_key(&chain_id) {
        info!("[SPONSORSHIP]: alchemy");

        match user_operation_variant.clone() {
            UserOperationRequestVariant::Default(user_operation) => {
                // Get the alchemy rpc url from the `ALCHEMY_RPC_URLS`.
                if let Some(alchemy_rpc_url) = (*ALCHEMY_RPC_URLS).get(&chain_id) {
                    let sponsorship = get_alchemy_paymaster_and_data(
                        format!("{}{}", alchemy_rpc_url, alchemy_api_key),
                        entry_point,
                        &user_operation,
                        (*ALCHEMY_POLICY_IDS).get(&chain_id).unwrap().to_string(),
                    )
                    .await
                    .map_err(JsonRpcError::from);

                    // If the sponsorship is successful, return the result.
                    if let Ok(sponsorship_data) = sponsorship {
                        let gas_and_paymaster_and_data = GasAndPaymasterAndData {
                            paymaster_and_data: sponsorship_data.result.paymaster_and_data,
                            call_gas_limit: sponsorship_data.result.call_gas_limit,
                            verification_gas_limit: sponsorship_data.result.verification_gas_limit,
                            pre_verification_gas: sponsorship_data.result.pre_verification_gas,
                        };
                        return Ok(GasAndPaymasterAndDataVariant::Default(
                            gas_and_paymaster_and_data,
                        ));
                    } else {
                        warn!("Failed to fetch user operation sponsorship from alchemy");
                        // error!("{:?}", sponsorship.unwrap_err());
                    }
                }
            }
            UserOperationRequestVariant::Packed(packed_user_operation) => {
                // Get the alchemy rpc url from the `ALCHEMY_RPC_URLS`.
                if let Some(alchemy_rpc_url) = (*ALCHEMY_RPC_URLS).get(&chain_id) {
                    let sponsorship = get_packed_alchemy_paymaster_and_data(
                        format!("{}{}", alchemy_rpc_url, alchemy_api_key),
                        entry_point,
                        &packed_user_operation,
                        (*ALCHEMY_POLICY_IDS).get(&chain_id).unwrap().to_string(),
                    )
                    .await
                    .map_err(JsonRpcError::from);

                    // If the sponsorship is successful, return the result.
                    if let Ok(sponsorship_data) = sponsorship {
                        let packed_gas_and_paymaster_and_data = PackedGasAndPaymasterAndData {
                            call_gas_limit: sponsorship_data.result.call_gas_limit,
                            verification_gas_limit: sponsorship_data.result.verification_gas_limit,
                            pre_verification_gas: sponsorship_data.result.pre_verification_gas,
                            paymaster: sponsorship_data.result.paymaster,
                            paymaster_verification_gas_limit: sponsorship_data
                                .result
                                .paymaster_verification_gas_limit,
                            paymaster_post_op_gas_limit: sponsorship_data
                                .result
                                .paymaster_post_op_gas_limit,
                            paymaster_data: sponsorship_data.result.paymaster_data,
                        };
                        return Ok(GasAndPaymasterAndDataVariant::Packed(
                            packed_gas_and_paymaster_and_data,
                        ));
                    } else {
                        warn!("Failed to fetch user operation sponsorship from alchemy");
                    }
                }
            }
        };
    }

    // Check if the `chain_id` is one of the key of `BICONOMY_POLICY_IDS`.
    if (*BICONOMY_POLICY_IDS).contains_key(&chain_id) {
        info!("[SPONSORSHIP]: biconomy");

        match user_operation_variant.clone() {
            UserOperationRequestVariant::Default(user_operation) => {
                // Get the alchemy rpc url from the `BICONOMY_PAYMASTER_RPC_URLS`.
                if let Some(biconomy_rpc_url) = (*BICONOMY_PAYMASTER_RPC_URLS).get(&chain_id) {
                    let sponsorship = get_biconomy_paymaster_and_data(
                        format!(
                            "{}{}",
                            biconomy_rpc_url,
                            BICONOMY_POLICY_IDS.get(&chain_id).unwrap()
                        ),
                        &user_operation,
                    )
                    .await
                    .map_err(JsonRpcError::from);

                    // If the sponsorship is successful, return the result.
                    if let Ok(sponsorship_data) = sponsorship {
                        let gas_and_paymaster_and_data = GasAndPaymasterAndData {
                            paymaster_and_data: sponsorship_data.result.paymaster_and_data,
                            call_gas_limit: user_operation.call_gas_limit.unwrap_or_default(),
                            verification_gas_limit: user_operation
                                .verification_gas_limit
                                .unwrap_or_default(),
                            pre_verification_gas: user_operation
                                .pre_verification_gas
                                .unwrap_or_default(),
                        };
                        return Ok(GasAndPaymasterAndDataVariant::Default(
                            gas_and_paymaster_and_data,
                        ));
                    } else {
                        warn!("Failed to fetch user operation sponsorship from alchemy");
                        // error!("{:?}", sponsorship.unwrap_err());
                    }
                }
            }
            UserOperationRequestVariant::Packed(_) => {
                warn!("Packed user operation is not supported by biconomy");
            }
        };
    }

    // If the sponsorship is not successful, return error.
    Err(eyre!("Failed to fetch user operation sponsorship"))
}
