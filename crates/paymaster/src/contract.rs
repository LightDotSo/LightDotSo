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
    contract::abigen,
    providers::{Http, Provider},
    types::{Address, Bytes},
};
use eyre::Result;

use crate::types::UserOperationConstruct;

abigen!(LightVerifyingPaymaster, "abi/LightVerifyingPaymaster.json",);

pub async fn get_hash(
    chain_id: u64,
    verifying_paymaster_address: Address,
    user_operation: UserOperationConstruct,
    valid_until: u64,
    valid_after: u64,
) -> Result<[u8; 32]> {
    // Get the provider.
    let provider = Provider::<Http>::try_from(format!(
        "http://lightdotso-rpc-internal:3000/internal/{}",
        chain_id
    ))?;

    // Get the contract.
    let contract = LightVerifyingPaymaster::new(verifying_paymaster_address, provider.into());

    // Get the hash.
    let hash = contract
        .get_hash(
            UserOperation {
                sender: user_operation.sender,
                nonce: user_operation.nonce,
                init_code: user_operation.init_code,
                call_data: user_operation.call_data,
                call_gas_limit: user_operation.call_gas_limit,
                verification_gas_limit: user_operation.verification_gas_limit,
                pre_verification_gas: user_operation.pre_verification_gas,
                max_fee_per_gas: user_operation.max_fee_per_gas,
                max_priority_fee_per_gas: user_operation.max_priority_fee_per_gas,
                paymaster_and_data: Bytes::default(),
                signature: user_operation.signature,
            },
            valid_until,
            valid_after,
        )
        .await?;

    Ok(hash)
}
