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
    result::AppJsonResult,
    routes::{
        configuration_operation::types::ConfigurationOperation,
        user_operation::types::UserOperation,
    },
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use const_hex::hex;
use lightdotso_tracing::tracing::info;
use prisma_client_rust::{
    chrono::{DateTime, FixedOffset},
    raw,
};
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

use super::types::Operation;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    pub offset: Option<i64>,
    pub limit: Option<i64>,
    pub address: Option<String>,
    pub chain_id: Option<i64>,
    pub status: Option<String>,
    pub is_testnet: Option<bool>,
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub struct OperationListCount {
    pub count: i64,
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

#[utoipa::path(
    get,
    path = "/operation/list",
    params(
        ListQuery
    ),
    responses(
        (status = 200, description = "Operations returned successfully", body = [Operation]),
        (status = 500, description = "Operation bad request", body = OperationError),
    )
)]
#[autometrics]
pub(crate) async fn v1_operation_list_handler(
    list_query: Query<ListQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<Vec<Operation>> {
    let Query(query) = list_query;

    info!("List operations: {:?}", query);

    let address_condition = query
        .address
        .as_ref()
        .map(|addr| {
            format!(
                "AND (UserOperation.sender = '{}' OR ConfigurationOperation.address = '{}')",
                addr, addr
            )
        })
        .unwrap_or_default();

    let chain_id_condition =
        query.chain_id.map(|id| format!("AND UserOperation.chainId = {}", id)).unwrap_or_default();

    let status_condition = query
        .status
        .as_ref()
        .map(|status| {
            format!(
                "AND (UserOperation.status = '{}' OR ConfigurationOperation.status = '{}')",
                status, status
            )
        })
        .unwrap_or_default();

    let is_testnet_condition = query
        .is_testnet
        .map(|is_testnet| {
            format!("AND UserOperation.isTestnet = {}", if is_testnet { 1 } else { 0 })
        })
        .unwrap_or_default();

    let sql = format!(
        "SELECT 'UserOperation' as operation_type, UserOperation.*
         FROM UserOperation
         WHERE 1=1 {} {} {} {}
         UNION ALL
         SELECT 'ConfigurationOperation' as operation_type, ConfigurationOperation.*
         FROM ConfigurationOperation
         WHERE 1=1 {}
         ORDER BY created_at DESC
         LIMIT {} OFFSET {}",
        address_condition,
        chain_id_condition,
        status_condition,
        is_testnet_condition,
        address_condition,
        query.limit.unwrap_or(10),
        query.offset.unwrap_or(0)
    );

    let result: Vec<OperationQueryReturnResult> =
        state.client._query_raw(raw!(&sql)).exec().await?;

    let operations: Vec<Operation> = result
        .into_iter()
        .map(|op| match op.operation {
            OperationData::UserOperation(uo) => Operation::UserOperation(uo.into()),
            OperationData::ConfigurationOperation(co) => {
                Operation::ConfigurationOperation(co.into())
            }
        })
        .collect();
    Ok(Json::from(operations))
}

#[utoipa::path(
    get,
    path = "/operation/list/count",
    params(
        ListQuery
    ),
    responses(
        (status = 200, description = "Operation count returned successfully", body = OperationListCount),
        (status = 500, description = "Operation count bad request", body = OperationError),
    )
)]
#[autometrics]
pub(crate) async fn v1_operation_list_count_handler(
    list_query: Query<ListQuery>,
    State(state): State<AppState>,
) -> AppJsonResult<OperationListCount> {
    let Query(query) = list_query;

    info!("Count operations: {:?}", query);

    let address_condition = query
        .address
        .as_ref()
        .map(|addr| {
            format!(
                "AND (UserOperation.sender = '{}' OR ConfigurationOperation.address = '{}')",
                addr, addr
            )
        })
        .unwrap_or_default();

    let chain_id_condition =
        query.chain_id.map(|id| format!("AND UserOperation.chainId = {}", id)).unwrap_or_default();

    let status_condition = query
        .status
        .as_ref()
        .map(|status| {
            format!(
                "AND (UserOperation.status = '{}' OR ConfigurationOperation.status = '{}')",
                status, status
            )
        })
        .unwrap_or_default();

    let is_testnet_condition = query
        .is_testnet
        .map(|is_testnet| {
            format!("AND UserOperation.isTestnet = {}", if is_testnet { 1 } else { 0 })
        })
        .unwrap_or_default();

    let sql = format!(
        "SELECT COUNT(*) as count FROM (
            SELECT UserOperation.hash
            FROM UserOperation
            WHERE 1=1 {} {} {} {}
            UNION ALL
            SELECT ConfigurationOperation.id
            FROM ConfigurationOperation
            WHERE 1=1 {}
        ) as combined",
        address_condition,
        chain_id_condition,
        status_condition,
        is_testnet_condition,
        address_condition
    );

    let result: Vec<CountQueryResult> = state.client._query_raw(raw!(&sql)).exec().await?;

    let count = result.first().map(|r| r.count).unwrap_or(0);

    Ok(Json::from(OperationListCount { count }))
}

// -----------------------------------------------------------------------------
// Implementations
// -----------------------------------------------------------------------------

impl From<UserOperationQueryReturnResult> for UserOperation {
    fn from(uo: UserOperationQueryReturnResult) -> Self {
        Self {
            hash: uo.hash,
            sender: uo.sender,
            nonce: uo.nonce,
            init_code: hex::encode(uo.init_code),
            call_data: hex::encode(uo.call_data),
            call_gas_limit: uo.call_gas_limit,
            verification_gas_limit: uo.verification_gas_limit,
            pre_verification_gas: uo.pre_verification_gas,
            max_fee_per_gas: uo.max_fee_per_gas,
            max_priority_fee_per_gas: uo.max_priority_fee_per_gas,
            paymaster_and_data: hex::encode(uo.paymaster_and_data),
            chain_id: uo.chain_id,
            status: uo.status,
            created_at: uo.created_at.to_rfc3339(),
            updated_at: uo.updated_at.to_rfc3339(),
            paymaster: None,
            paymaster_operation: None,
            signatures: vec![],
            transaction: None,
            interpretation: None,
        }
    }
}

impl From<ConfigurationOperationQueryReturnResult> for ConfigurationOperation {
    fn from(co: ConfigurationOperationQueryReturnResult) -> Self {
        Self {
            id: co.id,
            checkpoint: co.checkpoint,
            image_hash: co.image_hash,
            threshold: co.threshold,
            status: co.status,
        }
    }
}

// -----------------------------------------------------------------------------
// Query Result Types
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
pub struct OperationQueryReturnResult {
    pub operation_type: String,
    #[serde(flatten)]
    pub operation: OperationData,
}

#[allow(clippy::large_enum_variant)]
#[derive(Debug, Deserialize)]
#[serde(untagged)]
pub enum OperationData {
    UserOperation(UserOperationQueryReturnResult),
    ConfigurationOperation(ConfigurationOperationQueryReturnResult),
}

#[derive(Debug, Deserialize)]
pub struct UserOperationQueryReturnResult {
    pub hash: String,
    pub sender: String,
    pub nonce: i64,
    pub init_code: Vec<u8>,
    pub call_data: Vec<u8>,
    pub call_gas_limit: i64,
    pub verification_gas_limit: i64,
    pub pre_verification_gas: i64,
    pub max_fee_per_gas: i64,
    pub max_priority_fee_per_gas: i64,
    pub paymaster_and_data: Vec<u8>,
    pub signature: Option<Vec<u8>>,
    pub chain_id: i64,
    pub transaction_hash: Option<String>,
    pub status: String,
    pub entry_point: String,
    pub paymaster_id: Option<String>,
    pub is_testnet: bool,
    pub paymaster_operation_id: Option<String>,
    pub created_at: DateTime<FixedOffset>,
    pub updated_at: DateTime<FixedOffset>,
    pub activity_id: Option<String>,
    pub metadata_id: Option<String>,
    pub interpretation_id: Option<String>,
    pub user_operation_merkle_root: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ConfigurationOperationQueryReturnResult {
    pub id: String,
    pub created_at: DateTime<FixedOffset>,
    pub updated_at: DateTime<FixedOffset>,
    pub address: String,
    pub checkpoint: i64,
    pub image_hash: String,
    pub threshold: i64,
    pub status: String,
    pub configuration_id: Option<String>,
}

#[derive(Debug, Deserialize)]
struct CountQueryResult {
    pub count: i64,
}
