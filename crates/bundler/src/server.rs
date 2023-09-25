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

use ethers::{
    prelude::LogMeta,
    providers::Middleware,
    types::{Address, BlockNumber, U256},
};
use eyre::format_err;
use silius_contracts::{
    entry_point::{EntryPointErr, UserOperationEventFilter},
    utils::parse_from_input_data,
    EntryPoint,
};
use silius_primitives::{
    get_address,
    simulation::{CodeHash, SimulationCheckError},
    UserOperation, UserOperationByHash, UserOperationGasEstimation, UserOperationHash,
    UserOperationReceipt,
};
use silius_uopool::Overhead;

use crate::utils::calculate_call_gas_limit;

pub type VecUo = Vec<UserOperation>;
pub type VecCh = Vec<CodeHash>;

/// The alternative mempool pool implementation that provides functionalities to add, remove,
/// validate, and serves data requests from the [RPC API](EthApiServer). Architecturally, the
/// [UoPool](UoPool) is the backend service managed by the [UoPoolService](UoPoolService) and serves
/// requests from the [RPC API](EthApiServer).
pub struct UoPool<M: Middleware + 'static> {
    /// The [EntryPoint](EntryPoint) contract object
    pub entry_point: EntryPoint<M>,
    // The maximum gas limit for [UserOperation](UserOperation) gas verification.
    pub max_verification_gas: U256,
    // The [EIP-155](https://eips.ethereum.org/EIPS/eip-155) chain ID
    pub chain_id: u64,
}

impl<M: Middleware + 'static> UoPool<M> {
    /// Creates a new [UoPool](UoPool) object
    ///
    /// # Arguments
    /// `eth_client` - The Ethereum client [Middleware](ethers::providers::Middleware)
    /// `max_verification_gas` - The maximum gas limit for [UserOperation](UserOperation) gas
    /// verification. `chain` - The [EIP-155](https://eips.ethereum.org/EIPS/eip-155) chain ID
    ///
    /// # Returns
    /// `Self` - The [UoPool](UoPool) object
    pub fn new(entry_point: EntryPoint<M>, max_verification_gas: U256, chain_id: u64) -> Self {
        Self { entry_point, max_verification_gas, chain_id }
    }

    /// Returns the [EntryPoint](EntryPoint) contract address
    ///
    /// # Returns
    /// `Address` - The [EntryPoint](EntryPoint) contract address
    pub fn entry_point_address(&self) -> Address {
        self.entry_point.address()
    }

    /// Gets the block base fee per gas
    ///
    /// # Returns
    /// `Result<U256, eyre::Error>` - The block base fee per gas.
    pub async fn base_fee_per_gas(&self) -> eyre::Result<U256> {
        let block = self
            .entry_point
            .eth_client()
            .get_block(BlockNumber::Latest)
            .await?
            .ok_or(format_err!("No block found"))?;
        block.base_fee_per_gas.ok_or(format_err!("No base fee found"))
    }

    /// Estimates the `verification_gas_limit`, `call_gas_limit` and `pre_verification_gas` for a
    /// user operation. The function is indirectly invoked by the `estimate_user_operation_gas`
    /// JSON RPC method.
    ///
    /// # Arguments
    /// * `uo` - The [UserOperation](UserOperation) to estimate the gas for.
    ///
    /// # Returns
    /// `Result<UserOperationGasEstimation, SimulationCheckError>` - The gas estimation result,
    /// which includes the `verification_gas_limit`, `call_gas_limit` and `pre_verification_gas`.
    pub async fn estimate_user_operation_gas(
        &self,
        uo: &UserOperation,
    ) -> Result<UserOperationGasEstimation, SimulationCheckError> {
        // let val_out = self
        //     .validator
        //     .validate_user_operation(uo, UserOperationValidatorMode::SimulationTrace.into())
        //     .await
        //     .map_err(|err| match err {
        //         ValidationError::Sanity(_) => {
        //             SimulationCheckError::UnknownError { message: "Unknown error".to_string() }
        //         }
        //         ValidationError::Simulation(err) => err,
        //     })?;

        match self.entry_point.simulate_execution(uo.clone()).await {
            Ok(_) => {}
            Err(err) => {
                return Err(match err {
                    EntryPointErr::JsonRpcError(err) => {
                        SimulationCheckError::Execution { message: err.message }
                    }
                    _ => SimulationCheckError::UnknownError { message: format!("{err:?}") },
                })
            }
        }

        let exec_res = match self.entry_point.simulate_handle_op(uo.clone()).await {
            Ok(res) => res,
            Err(err) => {
                return Err(match err {
                    EntryPointErr::JsonRpcError(err) => {
                        SimulationCheckError::Execution { message: err.message }
                    }
                    _ => SimulationCheckError::UnknownError { message: format!("{err:?}") },
                })
            }
        };

        let base_fee_per_gas = self
            .base_fee_per_gas()
            .await
            .map_err(|err| SimulationCheckError::UnknownError { message: err.to_string() })?;
        let call_gas_limit = calculate_call_gas_limit(
            exec_res.paid,
            exec_res.pre_op_gas,
            uo.max_fee_per_gas.min(uo.max_priority_fee_per_gas + base_fee_per_gas),
        );

        Ok(UserOperationGasEstimation {
            pre_verification_gas: Overhead::default().calculate_pre_verification_gas(uo),
            verification_gas_limit: Overhead::default().calculate_pre_verification_gas(uo),
            // verification_gas_limit: val_out.verification_gas_limit,
            call_gas_limit,
        })
    }

    /// Filters the events logged from the [EntryPoint](EntryPoint) contract for a given user
    /// operation hash.
    ///
    /// # Arguments
    /// * `uo_hash` - The [UserOperationHash](UserOperationHash) to filter the events for.
    ///
    /// # Returns
    /// `Result<Option<(UserOperationEventFilter, LogMeta)>, eyre::Error>` - The filtered event, if
    /// any.
    pub async fn get_user_operation_event_meta(
        &self,
        uo_hash: &UserOperationHash,
    ) -> eyre::Result<Option<(UserOperationEventFilter, LogMeta)>> {
        let mut event: Option<(UserOperationEventFilter, LogMeta)> = None;
        let filter = self
            .entry_point
            .entry_point_api()
            .event::<UserOperationEventFilter>()
            .topic1(uo_hash.0);
        let res: Vec<(UserOperationEventFilter, LogMeta)> = filter.query_with_meta().await?;
        // It is possible have two same user operatation in same bundle
        // see https://twitter.com/leekt216/status/1636414866662785024
        for log_meta in res.iter() {
            event = Some(log_meta.clone());
        }
        Ok(event)
    }

    /// Gets the user operation by hash.
    /// The function is indirectly invoked by the `get_user_operation_by_hash` JSON RPC method.
    ///
    /// # Arguments
    /// * `uo_hash` - The [UserOperationHash](UserOperationHash) to get the user operation for.
    ///
    /// # Returns
    /// `Result<UserOperationByHash, eyre::Error>` - The user operation, if any.
    pub async fn get_user_operation_by_hash(
        &self,
        uo_hash: &UserOperationHash,
    ) -> eyre::Result<UserOperationByHash> {
        let event = self.get_user_operation_event_meta(uo_hash).await?;

        if let Some((event, log_meta)) = event {
            if let Some((uo, ep)) = self
                .entry_point
                .eth_client()
                .get_transaction(log_meta.transaction_hash)
                .await?
                .and_then(|tx| {
                    let uos = parse_from_input_data(tx.input)?;
                    let ep = tx.to?;
                    uos.iter()
                        .find(|uo| uo.sender == event.sender && uo.nonce == event.nonce)
                        .map(|uo| (uo.clone(), ep))
                })
            {
                return Ok(UserOperationByHash {
                    user_operation: uo,
                    entry_point: ep,
                    transaction_hash: log_meta.transaction_hash,
                    block_hash: log_meta.block_hash,
                    block_number: log_meta.block_number,
                });
            }
        }

        Err(format_err!("No user operation found"))
    }

    /// Gets the [UserOperationReceipt](UserOperationReceipt) by hash.
    /// The function is indirectly invoked by the `get_user_operation_receipt` JSON RPC method.
    ///
    /// # Arguments
    /// * `uo_hash` - The [UserOperationHash](UserOperationHash) to get the user operation receipt
    ///   for.
    ///
    /// # Returns
    /// `Result<UserOperationReceipt, eyre::Error>` - The user operation receipt, if any.
    pub async fn get_user_operation_receipt(
        &self,
        uo_hash: &UserOperationHash,
    ) -> eyre::Result<UserOperationReceipt> {
        let event = self.get_user_operation_event_meta(uo_hash).await?;

        if let Some((event, log_meta)) = event {
            if let Some(tx_receipt) = self
                .entry_point
                .eth_client()
                .get_transaction_receipt(log_meta.transaction_hash)
                .await?
            {
                let uo = self.get_user_operation_by_hash(uo_hash).await?;
                return Ok(UserOperationReceipt {
                    user_operation_hash: *uo_hash,
                    sender: event.sender,
                    nonce: event.nonce,
                    actual_gas_cost: event.actual_gas_cost,
                    actual_gas_used: event.actual_gas_used,
                    success: event.success,
                    tx_receipt: tx_receipt.clone(),
                    logs: tx_receipt.logs.into_iter().collect(),
                    paymaster: get_address(&uo.user_operation.paymaster_and_data),
                    reason: String::new(),
                });
            }
        }

        Err(format_err!("No user operation found"))
    }
}
