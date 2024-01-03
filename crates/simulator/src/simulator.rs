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
use ethers_main::abi::Uint;
use eyre::{eyre, Result};
use lightdotso_contracts::provider::get_provider;
use std::str::FromStr;

async fn run(
    evm: &mut Evm,
    transaction: SimulationRequest,
    commit: bool,
) -> Result<SimulationResponse> {
    // Accept value in hex or decimal formats
    let value = if let Some(value) = transaction.value {
        if value.starts_with("0x") {
            Some(
                Uint::from_str(value.as_str())
                    .map_err(|_err| eyre!("Failed to parse value as hex: {}", value))?,
            )
        } else {
            Some(
                Uint::from_dec_str(value.as_str())
                    .map_err(|_err| eyre!("Failed to parse value as dec: {}", value))?,
            )
        }
    } else {
        None
    };

    let result = if commit {
        evm.call_raw_committing(
            transaction.from,
            transaction.to,
            value,
            transaction.data,
            transaction.gas_limit,
        )
        .await
        .map_err(|_err| eyre!("Failed to commit transaction"))?
    } else {
        evm.call_raw(transaction.from, transaction.to, value, transaction.data)
            .await
            .map_err(|_err| eyre!("Failed to call transaction"))?
    };

    Ok(SimulationResponse {
        gas_used: result.gas_used,
        block_number: result.block_number,
        success: result.success,
        arena: result.trace.clone(),
        logs: result.logs,
        exit_reason: result.exit_reason,
    })
}

pub async fn simulate(transaction: SimulationRequest) -> Result<SimulationResponse> {
    let fork_url = get_provider(transaction.chain_id).await?.url().to_string();
    let mut evm =
        Evm::new(None, fork_url, transaction.block_number, transaction.gas_limit, true).await;

    let response = run(&mut evm, transaction, false).await?;

    Ok(response)
}

pub async fn simulate_bundle(
    transactions: Vec<SimulationRequest>,
) -> Result<Vec<SimulationResponse>> {
    let first_chain_id = transactions[0].chain_id;
    let first_block_number = transactions[0].block_number;

    let fork_url = get_provider(first_chain_id).await?.url().to_string();
    let mut evm =
        Evm::new(None, fork_url, first_block_number, transactions[0].gas_limit, true).await;

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

    Ok(response)
}
