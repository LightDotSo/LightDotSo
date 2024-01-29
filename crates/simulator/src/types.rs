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

use ethers::abi::{AbiDecode, AbiError};
use ethers_main::{
    abi::Address,
    contract::abigen,
    types::{Bytes, Log, U256},
};
use eyre::{eyre, Result};
use foundry_evm::trace::CallTraceArena;
use revm::interpreter::InstructionResult;
use serde::{Deserialize, Serialize};

abigen!(
    LightWalletFactory,
    r#"[
        createAccount(bytes32 hash, bytes32 salt)
    ]"#,
);

abigen!(
    LightWallet,
    r#"[
        execute(address dest, uint256 value, bytes calldata func)
        executeBatch(address[] calldata dest, uint256[] calldata value, bytes[] calldata func)
    ]"#,
);

// Entire file is derived from https://github.com/EnsoFinance/transaction-simulator/blob/42bc679fb171de760838457820d5c6622e53ab15/src/simulation.rs
// License: MIT

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SimulationRequest {
    /// Chain ID of the network
    pub chain_id: u64,
    /// From address of the transaction
    pub from: Address,
    /// To address of the transaction
    pub to: Address,
    /// Calldata of the transaction
    pub data: Option<Bytes>,
    /// Gas limit of the transaction
    pub gas_limit: u64,
    /// Value to send
    pub value: Option<u64>,
    /// Block number of the request
    pub block_number: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SimulationUserOperationRequest {
    /// Chain ID of the network
    pub chain_id: u64,
    /// From address of the transaction
    pub sender: Address,
    /// Nonce of the transaction
    pub nonce: u64,
    /// Init code of the transaction
    pub init_code: Option<Bytes>,
    /// Calldata of the transaction
    pub call_data: Option<Bytes>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SimulationResponse {
    /// Gas used by the transaction
    pub gas_used: u64,
    /// Block number of the simulation
    pub block_number: u64,
    /// Whether the transaction was successful
    pub success: bool,
    /// Trace of the transaction in the form of a CallTraceArena
    pub arena: Option<CallTraceArena>,
    /// Logs of the transaction
    pub logs: Vec<Log>,
    /// Exit reason of the transaction
    pub exit_reason: InstructionResult,
}

#[derive(Debug, Clone)]
pub struct CallRawResult {
    pub gas_used: u64,
    pub block_number: u64,
    pub success: bool,
    pub trace: Option<CallTraceArena>,
    pub logs: Vec<Log>,
    pub exit_reason: InstructionResult,
    pub return_data: Bytes,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct UserOperationRequest {
    /// Chain ID of the network
    /// Specific for the request
    pub chain_id: u64,
    /// Block number of the request
    pub block_number: Option<u64>,
    /// From address of the transaction
    pub sender: Address,
    /// Entrypoint address of the transaction
    pub entrypoint: Option<Address>,
    /// Nonce of the transaction
    pub nonce: Option<U256>,
    /// Init code of the transaction
    pub init_code: Option<Bytes>,
    /// Calldata of the transaction
    pub call_data: Option<Bytes>,
    /// Gas limit of the transaction
    pub call_gas_limit: Option<U256>,
    /// Verification gas limit of the transaction
    pub verification_gas_limit: Option<U256>,
    /// Pre verification gas limit of the transaction
    pub pre_verification_gas: Option<U256>,
    /// Max fee per gas of the transaction
    pub max_fee_per_gas: Option<U256>,
    /// Max priority fee per gas of the transaction
    pub max_priority_fee_per_gas: Option<U256>,
    /// Paymaster and data of the transaction
    pub paymaster_and_data: Option<Bytes>,
    /// Signature of the transaction
    pub signature: Option<Bytes>,
}

// -----------------------------------------------------------------------------
// Try From
// -----------------------------------------------------------------------------

impl TryFrom<SimulationUserOperationRequest> for Vec<SimulationRequest> {
    type Error = eyre::Report;

    fn try_from(params: SimulationUserOperationRequest) -> Result<Self, Self::Error> {
        let mut requests = vec![];

        if let Some(init_code) = params.clone().init_code {
            // Check if the length is more than 20 bytes
            if init_code.0.len() > 20 {
                // Try decoding for `createAccount`
                // Omit the first 20 bytes (the address of the contract)
                let factory_addr = Address::from_slice(&init_code.0[..20]);
                let res: Result<CreateAccountCall, AbiError> =
                    CreateAccountCall::decode(&init_code.0.slice(20..));

                if res.is_ok() {
                    requests.push(SimulationRequest {
                        chain_id: params.chain_id,
                        from: params.sender,
                        to: factory_addr,
                        data: Some(init_code),
                        gas_limit: u64::MAX,
                        value: None,
                        block_number: None,
                    });
                }
            }
        }

        if let Some(call_data) = params.clone().call_data {
            // Try decoding for `execute`
            let res: Result<ExecuteCall, AbiError> = ExecuteCall::decode(&call_data);

            if let Ok(decoded) = res {
                requests.push(SimulationRequest {
                    chain_id: params.chain_id,
                    from: params.sender,
                    to: decoded.dest,
                    data: Some(decoded.func.0.into()),
                    gas_limit: u64::MAX,
                    value: Some(decoded.value.low_u64()),
                    block_number: None,
                });
            }
        }

        if let Some(call_data) = params.clone().call_data {
            // Try decoding for `executeBatch`
            let res: Result<ExecuteBatchCall, AbiError> = ExecuteBatchCall::decode(&call_data);

            if let Ok(decoded) = res {
                for ((dest, value), func) in
                    decoded.dest.into_iter().zip(decoded.value).zip(decoded.func)
                {
                    requests.push(SimulationRequest {
                        chain_id: params.chain_id,
                        from: params.sender,
                        to: dest,
                        data: Some(func.0.into()),
                        gas_limit: u64::MAX,
                        value: Some(value.low_u64()),
                        block_number: None,
                    });
                }
            }
        }

        if requests.is_empty() {
            Err(eyre!("Invalid transaction"))
        } else {
            Ok(requests)
        }
    }
}

// -----------------------------------------------------------------------------
// From
// -----------------------------------------------------------------------------

impl From<UserOperationRequest> for SimulationRequest {
    fn from(uo: UserOperationRequest) -> Self {
        SimulationRequest {
            chain_id: uo.chain_id,
            from: uo.sender,
            to: uo.entrypoint.unwrap_or_default(),
            data: uo.call_data,
            gas_limit: uo.call_gas_limit.unwrap_or_default().low_u64(),
            value: None,
            block_number: uo.block_number,
        }
    }
}
