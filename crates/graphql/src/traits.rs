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

use crate::polling::user_operations::UserOperation;
use lightdotso_common::traits::HexToBytes;
use lightdotso_prisma::{user_operation, UserOperationStatus};

pub struct UserOperationConstruct {
    pub user_operation: UserOperation,
    pub chain_id: i64,
}

// Implement From<UserOperationConstruct> for User operation.
impl From<UserOperationConstruct> for user_operation::Data {
    fn from(op: UserOperationConstruct) -> Self {
        Self {
            chain_id: op.chain_id,
            hash: op.user_operation.id.0.parse().unwrap(),
            sender: op.user_operation.sender.0.parse().unwrap(),
            nonce: op.user_operation.nonce.0.parse().unwrap(),
            init_code: op.user_operation.init_code.clone().0.hex_to_bytes().unwrap(),
            call_data: op.user_operation.call_data.clone().0.hex_to_bytes().unwrap(),
            call_gas_limit: op.user_operation.call_gas_limit.0.parse().unwrap(),
            verification_gas_limit: op.user_operation.verification_gas_limit.0.parse().unwrap(),
            pre_verification_gas: op.user_operation.pre_verification_gas.0.parse().unwrap(),
            max_fee_per_gas: op.user_operation.max_fee_per_gas.0.parse().unwrap(),
            max_priority_fee_per_gas: op.user_operation.max_priority_fee_per_gas.0.parse().unwrap(),
            paymaster_and_data: op
                .user_operation
                .paymaster_and_data
                .clone()
                .0
                .hex_to_bytes()
                .unwrap(),
            status: UserOperationStatus::Executed,
            signature: op.user_operation.signature.clone().0.hex_to_bytes().unwrap().into(),
            entry_point: op.user_operation.entry_point.0.parse().unwrap(),
            paymaster: None,
            paymaster_id: None,
            transaction: None,
            transaction_hash: None,
            wallet: None,
            wallet_address: op.user_operation.light_wallet.id.0.parse().unwrap(),
            notification: None,
            notification_id: None,
            history: None,
            signatures: None,
            user_operation_category: None,
        }
    }
}
