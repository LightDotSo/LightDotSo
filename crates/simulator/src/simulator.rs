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
    let block_number = transaction.block_number.unwrap_or(latest_block_number.as_u64());

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
    let block_number = first_block_number.unwrap_or(latest_block_number.as_u64());

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
