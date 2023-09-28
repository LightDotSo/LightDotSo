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
    config::BundlerArgs, constants::ENTRYPOINT_ADDRESSES, eth_api::EthApiServer, server::UoPool,
};
use async_trait::async_trait;
use ethers::{
    prelude::k256::ecdsa::SigningKey,
    providers::{Http, Middleware, Provider},
    signers::{Signer, Wallet},
    types::{transaction::eip2718::TypedTransaction, Address, Eip1559TransactionRequest, U64},
    utils::to_checksum,
};
use jsonrpsee::{core::RpcResult, types::ErrorObjectOwned};
use lightdotso_contracts::provider::get_provider;
use lightdotso_jsonrpsee::error::JsonRpcError;
use lightdotso_tracing::tracing::{error, info, trace};
use silius_contracts::{entry_point::EntryPointAPI, EntryPoint};
use silius_primitives::{
    consts::rpc_error_codes::USER_OPERATION_HASH, UserOperation, UserOperationByHash,
    UserOperationGasEstimation, UserOperationHash, UserOperationPartial, UserOperationReceipt,
};
use std::{str::FromStr, sync::Arc, time::Duration};

/// Entire file derved from: https://github.com/Vid201/silius/blob/b1841aa614a9410907d1801128bf500f2a87596f/crates/rpc/src/eth.rs
/// License: MIT or Apache-2.0
/// Thank you to Vid201 for the wonderful work!

/// EthApiServer implements the ERC-4337 `eth` namespace RPC methods trait
/// [EthApiServer](EthApiServer).
pub struct EthApiServerImpl {
    pub args: BundlerArgs,
}

#[async_trait]
impl EthApiServer for EthApiServerImpl {
    /// Retrieve the current [EIP-155](https://eips.ethereum.org/EIPS/eip-155) chain ID.
    ///
    /// # Returns
    /// * `RpcResult<U64>` - The chain ID as a U64.
    async fn chain_id(&self, chain_id: u64) -> RpcResult<U64> {
        Ok(chain_id.into())
    }

    /// Get the supported entry points for [UserOperations](UserOperation).
    ///
    /// # Returns
    /// * `RpcResult<Vec<String>>` - A array of the entry point addresses as strings.
    async fn supported_entry_points(&self, _chain_id: u64) -> RpcResult<Vec<String>> {
        return Ok(ENTRYPOINT_ADDRESSES.into_iter().map(|ep| to_checksum(&ep, None)).collect());
    }

    /// Estimate the gas required for a [UserOperation](UserOperation) via the
    /// [EstimateUserOperationGasRequest](EstimateUserOperationGasRequest). This allows you to
    /// gauge the computational cost of the operation. See [How ERC-4337 Gas Estimation Works](https://www.alchemy.com/blog/erc-4337-gas-estimation).
    ///
    /// # Arguments
    /// * `user_operation: [UserOperationPartial](UserOperationPartial)` - The partial user
    ///   operation for which to estimate the gas.
    /// * `entry_point: Address` - The address of the entry point.
    ///
    /// # Returns
    /// * `RpcResult<UserOperationGasEstimation>` - The
    ///   [UserOperationGasEstimation](UserOperationGasEstimation) for the user operation.
    async fn estimate_user_operation_gas(
        &self,
        uo: UserOperationPartial,
        ep: Address,
        chain_id: u64,
    ) -> RpcResult<UserOperationGasEstimation> {
        // Parse the user operation.
        let uo: UserOperation = uo.into();

        // Get the server.
        let uopool = get_uo_pool(chain_id, ep).await?;

        // Estimate the gas.
        let res = uopool.estimate_user_operation_gas(&uo).await.map_err(JsonRpcError::from)?;

        Ok(res)
    }

    // From: https://github.com/Vid201/silius/blob/b1841aa614a9410907d1801128bf500f2a87596f/crates/bundler/src/bundler.rs#L252
    // And from: https://github.com/Vid201/silius/blob/b1841aa614a9410907d1801128bf500f2a87596f/crates/bundler/src/bundler.rs#L177

    /// Send a user operation via the [AddRequest](AddRequest).
    ///
    /// # Arguments
    /// * `user_operation: UserOperation` - The user operation to be sent.
    /// * `entry_point: Address` - The address of the entry point.
    ///
    /// # Returns
    /// * `RpcResult<UserOperationHash>` - The hash of the sent user operation.
    async fn send_user_operation(
        &self,
        user_operation: UserOperation,
        entry_point: Address,
        chain_id: u64,
    ) -> RpcResult<UserOperationHash> {
        info!("send_user_operation: {:?}", user_operation);

        // Get the provider.
        let provider = get_provider(chain_id).await.map_err(JsonRpcError::from)?;

        // Get the entry point.
        let ep = EntryPointAPI::new(entry_point, Arc::new(provider.clone()));

        // Construct the wallet.
        let wallet: Wallet<SigningKey> = self.args.private_key.parse().unwrap();
        let wallet = wallet.with_chain_id(chain_id);

        // Assert that the wallet address is the same as the `BUNDLER_ADDRESS` env var.
        assert_eq!(wallet.address(), self.args.bundler);

        // Get the nonce and balance.
        let nonce = provider
            .clone()
            .get_transaction_count(wallet.address(), None)
            .await
            .map_err(JsonRpcError::from)?;
        let balance = provider
            .clone()
            .get_balance(wallet.address(), None)
            .await
            .map_err(JsonRpcError::from)?;
        info!("nonce: {:?}, balance: {:?}", nonce, balance);

        // If the balance is less than the min balance, send the funds to the beneficiary.
        let beneficiary =
            if balance < self.args.min_balance { wallet.address() } else { self.args.beneficiary };
        info!("beneficiary: {:?}", beneficiary);

        let mut tx: TypedTransaction =
            ep.handle_ops(vec![user_operation.clone().into()], beneficiary).tx;
        info!("tx: {:?}", tx);

        // Get the server.
        let accesslist = provider
            .clone()
            .create_access_list(&tx, None)
            .await
            .map_err(JsonRpcError::from)?
            .access_list;
        tx.set_access_list(accesslist.clone());
        let estimated_gas =
            provider.clone().estimate_gas(&tx, None).await.map_err(JsonRpcError::from)?;

        // Get the max fee per gas and max priority fee.
        let (max_fee_per_gas, max_priority_fee) =
            provider.clone().estimate_eip1559_fees(None).await.map_err(JsonRpcError::from)?;

        // Construct the transaction.
        tx = TypedTransaction::Eip1559(Eip1559TransactionRequest {
            to: tx.to().cloned(),
            from: Some(wallet.address()),
            data: tx.data().cloned(),
            chain_id: Some(chain_id.into()),
            max_priority_fee_per_gas: Some(max_priority_fee),
            max_fee_per_gas: Some(max_fee_per_gas),
            gas: Some(estimated_gas),
            nonce: Some(nonce),
            value: None,
            access_list: accesslist,
        });
        info!("tx: {:?}", tx);

        trace!("Sending transaction to the execution client: {tx:?}");

        let tx = provider
            .send_transaction(tx, None)
            .await
            .map_err(JsonRpcError::from)?
            .interval(Duration::from_millis(75));
        let tx_hash = tx.tx_hash();
        info!("tx_hash: {:?}", tx_hash);

        let tx_receipt = tx.await.map_err(JsonRpcError::from)?;
        info!("tx_receipt: {:?}", tx_receipt);

        info!(
            "Bundle successfully sent, tx hash: {:?}, account: {:?}, entry point: {:?}, beneficiary: {:?}",
            tx_hash,
            wallet.address(),
            entry_point,
            beneficiary
        );
        trace!("Transaction receipt: {tx_receipt:?}");

        Ok(user_operation.hash(&ENTRYPOINT_ADDRESSES[0], &chain_id.into()))
    }

    /// Retrieve the receipt of a [UserOperation](UserOperation).
    ///
    /// # Arguments
    /// * `user_operation_hash: String` - The hash of the user operation.
    ///
    /// # Returns
    /// * `RpcResult<Option<UserOperationReceipt>>` - The [UserOperationReceipt] of the user
    ///   operation.
    async fn get_user_operation_receipt(
        &self,
        uo_hash: String,
        chain_id: u64,
    ) -> RpcResult<Option<UserOperationReceipt>> {
        // Get the server.
        let uopool = get_uo_pool(chain_id, ENTRYPOINT_ADDRESSES[0]).await?;

        match UserOperationHash::from_str(&uo_hash) {
            Ok(uo_hash) => match uopool.get_user_operation_receipt(&uo_hash).await {
                Ok(res) => {
                    let receipt = Some(UserOperationReceipt {
                        user_operation_hash: uo_hash,
                        sender: res.sender,
                        nonce: res.nonce,
                        paymaster: res.paymaster,
                        actual_gas_cost: res.actual_gas_cost,
                        actual_gas_used: res.actual_gas_used,
                        success: res.success,
                        reason: String::new(),
                        logs: res.logs.into_iter().collect(),
                        tx_receipt: res.tx_receipt,
                    });

                    Ok(receipt)
                }
                Err(_) => Err(ErrorObjectOwned::owned(
                    USER_OPERATION_HASH,
                    "Missing/invalid userOpHash".to_string(),
                    None::<bool>,
                )),
            },
            Err(_) => Err(ErrorObjectOwned::owned(
                USER_OPERATION_HASH,
                "Missing/invalid userOpHash".to_string(),
                None::<bool>,
            )),
        }
    }

    /// Retrieve a [UserOperation](UserOperation) by its hash via
    /// [UserOperationHashRequest](UserOperationHashRequest). The hash serves as a unique
    /// identifier for the [UserOperation](UserOperation).
    ///
    /// # Arguments
    /// * `user_operation_hash: String` - The hash of a [UserOperation](UserOperation).
    ///
    /// # Returns
    /// * `RpcResult<Option<UserOperationByHash>>` - The [UserOperation](UserOperation) associated
    ///   with the hash, or None if it does not exist.
    async fn get_user_operation_by_hash(
        &self,
        uo_hash: String,
        chain_id: u64,
    ) -> RpcResult<Option<UserOperationByHash>> {
        // Get the server.
        let uopool = get_uo_pool(chain_id, ENTRYPOINT_ADDRESSES[0]).await?;

        match UserOperationHash::from_str(&uo_hash) {
            Ok(uo_hash) => match uopool.get_user_operation_by_hash(&uo_hash).await {
                Ok(res) => {
                    let uo: Option<UserOperationByHash> = Some(UserOperationByHash {
                        user_operation: res.user_operation,
                        entry_point: ENTRYPOINT_ADDRESSES[0],
                        block_number: res.block_number,
                        block_hash: res.block_hash,
                        transaction_hash: res.transaction_hash,
                    });
                    Ok(uo)
                }
                Err(_) => {
                    error!("Missing/invalid userOpHash: {:?} at chain_id: {:?}", uo_hash, chain_id);
                    Err(ErrorObjectOwned::owned(
                        USER_OPERATION_HASH,
                        "Missing/invalid userOpHash".to_string(),
                        None::<bool>,
                    ))
                }
            },
            Err(_) => {
                error!("Missing/invalid userOpHash: {:?} at chain_id: {:?}", uo_hash, chain_id);
                Err(ErrorObjectOwned::owned(
                    USER_OPERATION_HASH,
                    "Missing/invalid userOpHash".to_string(),
                    None::<bool>,
                ))
            }
        }
    }
}

async fn get_uo_pool(chain_id: u64, ep: Address) -> RpcResult<UoPool<Provider<Http>>> {
    // Get the provider.
    let provider = get_provider(chain_id).await.map_err(JsonRpcError::from)?;
    // let provider = Provider::<Http>::try_from("https://sepolia.infura.io/v3/").unwrap();

    // Get the entry point.
    let entry_point = EntryPoint::new(Arc::new(provider.clone()), ep);

    // Get the server.
    let uopool = UoPool::new(entry_point, 3000000.into(), chain_id);

    Ok(uopool)
}
