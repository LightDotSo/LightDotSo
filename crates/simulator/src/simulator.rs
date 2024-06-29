// Copyright 2023-2024 Light
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

// Entire file is derived from https://github.com/EnsoFinance/transaction-simulator/blob/42bc679fb171de760838457820d5c6622e53ab15/src/simulation.rs
// License: MIT

use crate::{
    evm::Evm,
    types::{SimulationRequest, SimulationResponse},
};
use ethers::providers::Middleware;
use ethers_main::abi::Uint;
use eyre::{eyre, Result};
use lightdotso_contracts::provider::get_provider;

async fn run(
    evm: &mut Evm,
    request: SimulationRequest,
    commit: bool,
) -> Result<SimulationResponse> {
    // Get the value
    let value = request.value.map(Uint::from);

    // Run the transaction and get the result
    let result = if commit {
        evm.call_raw_committing(request.from, request.to, value, request.data, request.gas_limit)
            .await
            .map_err(|_err| eyre!("Failed to commit transaction"))?
    } else {
        evm.call_raw(request.from, request.to, value, request.data)
            .await
            .map_err(|_err| eyre!("Failed to call transaction"))?
    };

    // Return the result
    Ok(SimulationResponse {
        gas_used: result.gas_used,
        block_number: request.block_number.unwrap_or(0),
        success: result.success,
        arena: result.trace.clone(),
        logs: result.logs,
        exit_reason: result.exit_reason,
    })
}

pub async fn simulate(transaction: SimulationRequest) -> Result<SimulationResponse> {
    // Get the provider
    let provider = get_provider(transaction.chain_id).await?;

    // Get the fork url
    let fork_url = provider.url().to_string();

    // If block number is not provided, use the latest block number
    let latest_block_number = provider.get_block_number().await?;

    // Get the block number
    let block_number = transaction.block_number.unwrap_or(latest_block_number.low_u64());

    // Construct the EVM
    let mut evm = Evm::new(None, fork_url, Some(block_number), transaction.gas_limit, true).await;

    // Run the transaction
    let response = run(&mut evm, transaction, false).await?;

    // Return the response
    Ok(response)
}

pub async fn simulate_bundle(
    transactions: Vec<SimulationRequest>,
) -> Result<Vec<SimulationResponse>> {
    // Get the first chain id and block number
    let first_chain_id = transactions[0].chain_id;
    let first_block_number = transactions[0].block_number;

    // Get the provider
    let provider = get_provider(first_chain_id).await?;

    // Get the fork url
    let fork_url = provider.url().to_string();

    // If block number is not provided, use the latest block number
    let latest_block_number = provider.get_block_number().await?;

    // Get the block number
    let block_number = first_block_number.unwrap_or(latest_block_number.low_u64());

    // Construct the EVM
    let mut evm =
        Evm::new(None, fork_url, Some(block_number), transactions[0].gas_limit, true).await;

    // Run the transactions
    let mut response = Vec::with_capacity(transactions.len());
    for transaction in transactions {
        if transaction.chain_id != first_chain_id {
            return Err(eyre!("Multiple chain ids"));
        }
        if transaction.block_number != first_block_number {
            return Err(eyre!("Multiple block numbers"));
        }
        response.push(run(&mut evm, transaction, true).await?);
    }

    // Return the response
    Ok(response)
}
